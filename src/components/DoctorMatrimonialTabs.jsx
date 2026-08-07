import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Activity, Video, Crown, FileText, Settings, Layout, Bell, User } from 'lucide-react';
import './DoctorMatrimonialTabs.css';

// 1. Doctor Registrations
export const DocMatrimonialRegistrations = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Doctor Registrations</h3>
      <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', marginBottom: '16px' }}>Manage all registered doctors in the Matrimonial system.</p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input type="text" placeholder="Search by name, hospital, city..." className="admin-text-input" style={{ width: '300px' }} />
        <button className="admin-submit-btn">Filter</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name & Mobile</th>
            <th>City & Hospital</th>
            <th>Specialization</th>
            <th>Reg Date</th>
            <th>Status</th>
            <th>Premium</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No records found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 2. Verification Requests
export const DocMatrimonialVerification = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Verification Requests</h3>
      <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', marginBottom: '16px' }}>Approve or reject doctor verification documents.</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Document</th>
            <th>Submitted On</th>
            <th>Verification History</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No pending requests.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 3. Online Doctors
export const DocMatrimonialOnline = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Online Doctors (Live)</h3>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <span className="admin-perm-badge" style={{ background: '#dcfce7', color: '#166534' }}>Online: 0</span>
        <span className="admin-perm-badge" style={{ background: '#fef9c3', color: '#854d0e' }}>Busy: 0</span>
        <span className="admin-perm-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>In Video Call: 0</span>
        <span className="admin-perm-badge" style={{ background: '#e0f2fe', color: '#075985' }}>Waiting: 0</span>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th>Socket Status</th>
            <th>Heartbeat</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No online doctors currently.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 4. Video Sessions
export const DocMatrimonialSessions = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Video Sessions Log</h3>
      <button className="admin-submit-btn" style={{ marginBottom: '15px', background: '#22c55e', borderColor: '#22c55e' }}>Export CSV</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Caller</th>
            <th>Receiver</th>
            <th>Start Time</th>
            <th>End Time / Duration</th>
            <th>Status</th>
            <th>Location</th>
            <th>Report Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No sessions recorded.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 5. Premium Membership
export const DocMatrimonialPremium = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Premium Subscriptions</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Doctor Name</th>
            <th>Plan</th>
            <th>Valid Until</th>
            <th>Payment Status</th>
            <th>History</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No premium subscriptions yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 6. Reports
export const DocMatrimonialReports = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Reported Doctors & Abuse</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Reported Doctor</th>
            <th>Reported By</th>
            <th>Reason (Chat Abuse, Fake, Spam)</th>
            <th>Evidence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No reports.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 7. Matching Queue
export const DocMatrimonialQueue = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Live Matching Queue</h3>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <span className="admin-perm-badge">Users Waiting: 0</span>
        <span className="admin-perm-badge">Connected Pairs: 0</span>
        <span className="admin-perm-badge">Avg Wait Time: 0s</span>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Queue ID</th>
            <th>User</th>
            <th>Joined At</th>
            <th>Queue Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Queue is empty.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// 8. Live Analytics
export const DocMatrimonialAnalytics = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Live Analytics</h3>
      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card blue"><div className="admin-stat-label">Total Doctors</div><div className="admin-stat-value">0</div></div>
        <div className="admin-stat-card green"><div className="admin-stat-label">Online Doctors</div><div className="admin-stat-value">0</div></div>
        <div className="admin-stat-card amber"><div className="admin-stat-label">Premium Doctors</div><div className="admin-stat-value">0</div></div>
        <div className="admin-stat-card red"><div className="admin-stat-label">Video Calls Today</div><div className="admin-stat-value">0</div></div>
        <div className="admin-stat-card"><div className="admin-stat-label">Active Calls</div><div className="admin-stat-value">0</div></div>
        <div className="admin-stat-card"><div className="admin-stat-label">Pending Verification</div><div className="admin-stat-value">0</div></div>
      </div>
      <div style={{ height: '300px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Charts Module (Daily Registrations, Premium Sales, Online Users) - Under Construction
      </div>
    </div>
  );
};

// 9. Settings
export const DocMatrimonialSettings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      freeVideoTime: parseInt(e.target.freeVideoTime.value),
      premiumVideoTime: parseInt(e.target.premiumVideoTime.value),
      minAge: parseInt(e.target.minAge.value),
      maxAge: parseInt(e.target.maxAge.value),
      enableRandomMatch: e.target.enableRandomMatch.checked,
      enableVideoCalls: e.target.enableVideoCalls.checked,
      enablePremiumOnlyMode: e.target.enablePremiumOnlyMode.checked,
      enableGenderPreference: e.target.enableGenderPreference.checked,
      enableCityPreference: e.target.enableCityPreference.checked,
      enableNotifications: e.target.enableNotifications.checked,
      maintenanceMode: e.target.maintenanceMode.checked,
    };

    fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()).then(newData => {
      setSettings(newData);
      alert('Settings updated successfully!');
    });
  };

  if (!settings) return <div className="admin-table-card">Loading settings...</div>;

  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Matrimonial Platform Settings</h3>
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ marginBottom: '10px', color: '#1e293b' }}>Time & Age Limits</h4>
          <div className="admin-input-group"><label>Free Video Time (seconds)</label><input type="number" name="freeVideoTime" defaultValue={settings.freeVideoTime} className="admin-text-input" /></div>
          <div className="admin-input-group"><label>Premium Video Time (seconds)</label><input type="number" name="premiumVideoTime" defaultValue={settings.premiumVideoTime} className="admin-text-input" /></div>
          <div className="admin-input-group"><label>Minimum Age</label><input type="number" name="minAge" defaultValue={settings.minAge} className="admin-text-input" /></div>
          <div className="admin-input-group"><label>Maximum Age</label><input type="number" name="maxAge" defaultValue={settings.maxAge} className="admin-text-input" /></div>
        </div>
        <div>
          <h4 style={{ marginBottom: '10px', color: '#1e293b' }}>Feature Toggles</h4>
          {[
            { name: 'enableRandomMatch', label: 'Enable Random Match', checked: settings.enableRandomMatch },
            { name: 'enableVideoCalls', label: 'Enable Video Calls', checked: settings.enableVideoCalls },
            { name: 'enablePremiumOnlyMode', label: 'Enable Premium Only Mode', checked: settings.enablePremiumOnlyMode },
            { name: 'enableGenderPreference', label: 'Enable Gender Preference', checked: settings.enableGenderPreference },
            { name: 'enableCityPreference', label: 'Enable City Preference', checked: settings.enableCityPreference },
            { name: 'enableNotifications', label: 'Enable Notifications', checked: settings.enableNotifications },
            { name: 'maintenanceMode', label: 'Maintenance Mode', checked: settings.maintenanceMode },
          ].map(toggle => (
            <div className="admin-input-group" key={toggle.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name={toggle.name} defaultChecked={toggle.checked} id={toggle.name} />
              <label htmlFor={toggle.name} style={{ margin: 0 }}>{toggle.label}</label>
            </div>
          ))}
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="admin-submit-btn">Save All Settings</button>
        </div>
      </form>
    </div>
  );
};

// 10. CMS
export const DocMatrimonialCMS = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Content Management (CMS)</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['Privacy Policy', 'Terms', 'About', 'FAQ', 'Help Center', 'Contact'].map(page => (
          <button key={page} className="admin-submit-btn" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>Edit {page}</button>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <textarea className="admin-text-input" rows="15" placeholder="Select a page to edit content..." style={{ width: '100%' }}></textarea>
        <button className="admin-submit-btn" style={{ marginTop: '10px' }}>Save Content</button>
      </div>
    </div>
  );
};

// 11. Notification Center
export const DocMatrimonialNotifications = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Notification Center</h3>
      <div style={{ maxWidth: '600px' }}>
        <div className="admin-input-group">
          <label>Target Audience</label>
          <select className="admin-text-input">
            <option>All Doctors</option>
            <option>Premium Doctors</option>
            <option>Specific Doctor (via Email/ID)</option>
          </select>
        </div>
        <div className="admin-input-group">
          <label>Notification Type</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label><input type="checkbox" defaultChecked /> Push Notification</label>
            <label><input type="checkbox" defaultChecked /> Email</label>
            <label><input type="checkbox" /> SMS (Future Ready)</label>
          </div>
        </div>
        <div className="admin-input-group">
          <label>Message Title</label>
          <input type="text" className="admin-text-input" placeholder="e.g. System Update" />
        </div>
        <div className="admin-input-group">
          <label>Message Body</label>
          <textarea className="admin-text-input" rows="4" placeholder="Enter notification content..."></textarea>
        </div>
        <button className="admin-submit-btn">Send Notification</button>
      </div>
    </div>
  );
};

// 12. Doctor Profile View
export const DocMatrimonialProfile = () => {
  return (
    <div className="admin-table-card">
      <h3 className="admin-form-title">Doctor Full Profile View</h3>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ width: '150px', height: '150px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Photo</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 10px 0' }}>Dr. Example</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><strong>Specialization:</strong> Cardiologist</div>
            <div><strong>Experience:</strong> 8 Years</div>
            <div><strong>Hospital:</strong> Apollo</div>
            <div><strong>Education:</strong> MBBS, MD</div>
            <div><strong>Income:</strong> ₹10-15 LPA</div>
            <div><strong>Status:</strong> Active / Verified</div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="admin-submit-btn">View Certificates</button>
            <button className="admin-submit-btn" style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>Video Call History</button>
            <button className="admin-submit-btn" style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>Activity Timeline</button>
          </div>
        </div>
      </div>
    </div>
  );
};
