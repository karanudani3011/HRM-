const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
// Use a local DB for this demo/workspace
mongoose.connect('mongodb://127.0.0.1:27017/hrm_deversh')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const settingSchema = new mongoose.Schema({
  freeVideoTime: { type: Number, default: 30 },
  premiumVideoTime: { type: Number, default: 200 },
  minAge: { type: Number, default: 24 },
  maxAge: { type: Number, default: 60 },
  enableRandomMatch: { type: Boolean, default: true },
  enableVideoCalls: { type: Boolean, default: true },
  enablePremiumOnlyMode: { type: Boolean, default: false },
  enableGenderPreference: { type: Boolean, default: true },
  enableCityPreference: { type: Boolean, default: false },
  enableNotifications: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false }
});
const Setting = mongoose.model('Setting', settingSchema);

// Ensure default settings exist
const initSettings = async () => {
  const count = await Setting.countDocuments();
  if (count === 0) {
    await Setting.create({ freeVideoTime: 30, premiumVideoTime: 200 });
  }
};
initSettings();

// Admin Route to update settings
app.put('/api/settings', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (setting) {
      Object.assign(setting, req.body);
      await setting.save();
    } else {
      setting = await Setting.create(req.body);
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.json(setting || { freeTimer: 30, premiumTimer: 200 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Doctor Matrimonial Profile Schema
const docMatrimonySchema = new mongoose.Schema({
  fullName: String,
  mobile: String,
  caste: String,
  dob: String,
  timeOfBirth: String,
  placeOfBirth: String,
  height: String,
  weight: String,
  address: String,
  education: String,
  hospitalName: String,
  income: String,
  jobTitle: String,
  fatherDetails: String,
  motherDetails: String,
  brotherDetails: String,
  sisterDetails: String,
  astrologerMatch: String,
  habits: [String],
  partnerExpectations: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  premium: { type: Boolean, default: false }
});
const DocMatrimonyProfile = mongoose.model('DocMatrimonyProfile', docMatrimonySchema);

// Doctor Matrimonial Registration Route
app.post('/api/matrimony/register', async (req, res) => {
  try {
    const profile = await DocMatrimonyProfile.create(req.body);
    // Broadcast to all clients to refresh the live list
    io.emit('doctor_list_updated');
    res.status(201).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Online Doctors Route
app.get('/api/doctors/online', async (req, res) => {
  try {
    // Currently returns all pending/active doctors for demo, but can be filtered by online status
    // In production, you would map this to the users Map (socket) to check actual online presence
    // For now, let's fetch all doctors and assume they are online for the demo grid, or match them with the socket map
    const dbDoctors = await DocMatrimonyProfile.find({}).sort({ createdAt: -1 }).lean();
    
    // Check against Socket Map for "real" online status
    const onlineUserIds = Array.from(users.values()).map(u => u.userId);
    
    const mappedDoctors = dbDoctors.map(doc => {
      // Logic for calculating age if dob exists
      let age = 28; // Default
      if (doc.dob) {
        const birthDate = new Date(doc.dob);
        const diff = Date.now() - birthDate.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }

      return {
        _id: doc._id,
        name: doc.fullName || 'Dr. Unknown',
        photo: null, // Will use default if null
        age: age,
        city: doc.placeOfBirth || doc.address?.split(',')[0] || 'Unknown',
        hospital: doc.hospitalName || 'Clinic',
        specialization: doc.education || 'Physician',
        verified: doc.status === 'Verified' || true,
        premium: doc.premium || false,
        online: true // Mocking online for the grid, but you can filter by onlineUserIds.includes(doc._id.toString())
      };
    });
    
    res.json(mappedDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User State Management
const users = new Map(); // socketId -> { userId, role, status, plan, blockedUsers, lastMatchedWith }
let queue = [];

// Helper to get current settings
const getSettings = async () => {
  const setting = await Setting.findOne();
  return setting || { freeTimer: 30, premiumTimer: 200 };
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    // data = { userId, role: 'doctor', plan: 'free' | 'premium', blockedUsers: [] }
    users.set(socket.id, {
      socketId: socket.id,
      userId: data.userId || socket.id,
      role: data.role || 'doctor',
      status: 'online',
      plan: data.plan || 'free',
      blockedUsers: data.blockedUsers || [],
      lastMatchedWith: null
    });
    console.log(`User joined: ${socket.id} (${data.userId})`);
  });

  socket.on('start_search', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    user.status = 'searching';
    
    // Check queue for match
    const matchIndex = queue.findIndex(queuedUser => {
      // Must be online or searching
      if (queuedUser.status !== 'searching') return false;
      // Doctor ↔ Doctor only
      if (queuedUser.role !== 'doctor' || user.role !== 'doctor') return false;
      // Cannot match with same user twice continuously
      if (user.lastMatchedWith === queuedUser.userId) return false;
      if (queuedUser.lastMatchedWith === user.userId) return false;
      // Ignore Blocked
      if (user.blockedUsers.includes(queuedUser.userId) || queuedUser.blockedUsers.includes(user.userId)) return false;
      
      return true;
    });

    if (matchIndex !== -1) {
      const peer = queue.splice(matchIndex, 1)[0];
      
      user.status = 'busy';
      peer.status = 'busy';
      
      user.lastMatchedWith = peer.userId;
      peer.lastMatchedWith = user.userId;
      
      const roomId = `room_${Date.now()}_${Math.random()}`;

      getSettings().then(settings => {
        // Match found!
        socket.emit('matched', {
          roomId,
          peerId: peer.userId,
          initiator: true,
          plan: peer.plan,
          timer: user.plan === 'premium' ? settings.premiumTimer : settings.freeTimer
        });

        io.to(peer.socketId).emit('matched', {
          roomId,
          peerId: user.userId,
          initiator: false,
          plan: user.plan,
          timer: peer.plan === 'premium' ? settings.premiumTimer : settings.freeTimer
        });
      });

    } else {
      // Add to queue
      if (!queue.includes(user)) {
        queue.push(user);
      }
    }
  });

  socket.on('next_match', () => {
    const user = users.get(socket.id);
    if (user) {
      user.status = 'searching'; // Will stop being busy
      io.to(socket.id).emit('peer_disconnected'); // inform client to clean up WebRTC
      // Trigger new search automatically in client when they receive this, or do it here
      socket.emit('trigger_search');
    }
  });

  socket.on('end_call', () => {
    const user = users.get(socket.id);
    if (user) {
      user.status = 'online';
    }
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    const peerSocket = getSocketByUserId(data.target);
    if (peerSocket) io.to(peerSocket).emit('offer', { sender: users.get(socket.id).userId, offer: data.offer });
  });

  socket.on('answer', (data) => {
    const peerSocket = getSocketByUserId(data.target);
    if (peerSocket) io.to(peerSocket).emit('answer', { sender: users.get(socket.id).userId, answer: data.answer });
  });

  socket.on('ice-candidate', (data) => {
    const peerSocket = getSocketByUserId(data.target);
    if (peerSocket) io.to(peerSocket).emit('ice-candidate', { sender: users.get(socket.id).userId, candidate: data.candidate });
  });
  
  socket.on('peer_left', (data) => {
    const peerSocket = getSocketByUserId(data.target);
    if (peerSocket) {
      const peerUser = users.get(peerSocket);
      if (peerUser) peerUser.status = 'online';
      io.to(peerSocket).emit('peer_disconnected');
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      queue = queue.filter(u => u.socketId !== socket.id);
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

function getSocketByUserId(userId) {
  for (let [socketId, user] of users.entries()) {
    if (user.userId === userId) return socketId;
  }
  return null;
}

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
