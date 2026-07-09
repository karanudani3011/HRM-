import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import CardScanner from '../components/CardScanner';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';
import './AdminDashboard.css';

/* ── Inline SVG Icons ── */
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconUserStat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers]       = useState('—');
  const [newRegs, setNewRegs]             = useState('—');
  const [activeSessions, setActiveSessions] = useState('—');
  const [currentTime, setCurrentTime]     = useState('');

  // Role-based state
  const [permissions, setPermissions] = useState([]);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminCardId, setAdminCardId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-Admin Management state
  const [accounts, setAccounts] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPermissions, setNewPermissions] = useState({
    dashboard: false,
    services: false,
    leads: false,
    blogs: false,
    qrStats: false,
    adminAccess: false,
    scanner: false,
    scanLogs: false
  });

  // QR Stats state
  const [qrUsers, setQrUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  // Card Activation / Renew state
  const [privilegeCards, setPrivilegeCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardSearch, setCardSearch] = useState('');

  // Scan Logs state
  const [scanLogs, setScanLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchScanLogs = async () => {
    setLogsLoading(true);
    try {
      let query = supabase.from('card_scans').select('*').order('scanned_at', { ascending: false });
      
      // If not super admin, only fetch their own logs
      if (adminUsername !== 'admin') {
        query = query.eq('hospital_username', adminUsername);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setScanLogs(data || []);
    } catch (err) {
      console.error('Error fetching scan logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchPrivilegeCards = async () => {
    setCardsLoading(true);
    try {
      const { data, error } = await supabase
        .from('privilege_cards')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPrivilegeCards(data || []);
    } catch (err) {
      console.error('Error fetching privilege cards:', err);
    } finally {
      setCardsLoading(false);
    }
  };

  const handleActivateCard = async (cardId) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const joinDate = `${month}/${year}`;
    const expireDate = `${month}/${year + 1}`;

    try {
      const { error } = await supabase
        .from('privilege_cards')
        .update({ 
          card_status: 'ACTIVE',
          join_date: joinDate,
          expire_date: expireDate
        })
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} activated successfully! Valid until ${expireDate}`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to activate card:', err);
      alert('Error activating card: ' + err.message);
    }
  };

  const handleDeactivateCard = async (cardId) => {
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .update({ card_status: 'INACTIVE' })
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} deactivated!`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to deactivate card:', err);
      alert('Error deactivating card: ' + err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm(`Are you sure you want to delete card ${cardId}?`)) return;
    try {
      const { error } = await supabase
        .from('privilege_cards')
        .delete()
        .eq('id_no', cardId);

      if (error) throw error;
      alert(`Card ${cardId} deleted!`);
      fetchPrivilegeCards();
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Error deleting card: ' + err.message);
    }
  };

  /* ── Auth guard & Permissions init ── */
  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin/login', { replace: true });
      return;
    }

    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    setPermissions(perms);
    setAdminUsername(localStorage.getItem('adminUsername') || '');
    setAdminName(localStorage.getItem('adminName') || '');
    const cid = localStorage.getItem('adminCardId') || '';
    setAdminCardId(cid);

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'overview';
    
    if (tab === 'overview' && !perms.includes('dashboard')) {
      if (perms.includes('qrStats')) {
        navigate('/admin/dashboard?tab=qr-stats', { replace: true });
        setActiveTab('qr-stats');
      } else if (perms.includes('services')) {
        navigate('/admin/services', { replace: true });
      } else if (perms.includes('leads')) {
        navigate('/admin/leads', { replace: true });
      } else if (perms.includes('blogs')) {
        navigate('/admin/blogs', { replace: true });
      } else if (perms.includes('adminAccess')) {
        navigate('/admin/dashboard?tab=accounts', { replace: true });
        setActiveTab('accounts');
      } else if (perms.includes('scanner')) {
        navigate('/admin/dashboard?tab=scanner', { replace: true });
        setActiveTab('scanner');
      } else {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login', { replace: true });
      }
    } else {
      setActiveTab(tab);
    }
  }, [navigate]);

  /* ── Clock ── */
  useEffect(() => {
    const tick = () => setCurrentTime(
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    );
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  /* ── Fetch privilege cards when activation tab is active ── */
  useEffect(() => {
    if (activeTab === 'activation') {
      fetchPrivilegeCards();
    }
    if (activeTab === 'scan-logs') {
      fetchScanLogs();
    }
  }, [activeTab, adminUsername]);

  /* ── Real-time Firestore stats ── */
  useEffect(() => {
    if (!db || !permissions.includes('dashboard')) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const total = snap.size;
      setTotalUsers(total);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      let recent = 0;
      snap.forEach((doc) => {
        const d = doc.data().createdAt;
        if (d) {
          const date = d.toDate ? d.toDate() : new Date(d);
          if (date >= cutoff) recent++;
        }
      });
      setNewRegs(recent);
      setActiveSessions(total === 0 ? 0 : Math.max(1, Math.floor(total * 0.1) + Math.floor(Math.random() * 4)));
    }, (err) => {
      console.error('Snapshot error:', err);
      setTotalUsers(0); setNewRegs(0); setActiveSessions(0);
    });
    return () => unsub();
  }, [permissions]);

  /* ── Sub-Admin Accounts Realtime subscription ── */
  useEffect(() => {
    if (!db || !permissions.includes('adminAccess')) return;
    const unsub = onSnapshot(collection(db, 'adminAccess'), (snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setAccounts(list);
    });
    return () => unsub();
  }, [permissions]);

  /* ── QR Stats Realtime subscription ── */
  useEffect(() => {
    if (!db || !permissions.includes('qrStats') || !adminCardId) return;
    const cleanCardId = adminCardId.replace(/\s+/g, '').toUpperCase();
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const list = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.referredByCardId && data.referredByCardId.replace(/\s+/g, '').toUpperCase() === cleanCardId) {
          list.push({ id: doc.id, ...data });
        }
      });
      setQrUsers(list);
    }, (err) => {
      console.error('QR Stats snapshot error:', err);
    });
    return () => unsub();
  }, [permissions, adminCardId]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      alert('Username and Password are required');
      return;
    }
    
    const permsArray = Object.keys(newPermissions).filter(key => newPermissions[key]);
    
    try {
      await addDoc(collection(db, 'adminAccess'), {
        username: newUsername.trim(),
        password: newPassword.trim(),
        name: newDisplayName.trim(),
        permissions: permsArray,
        createdAt: new Date()
      });
      
      setNewUsername('');
      setNewPassword('');
      setNewDisplayName('');
      setNewPermissions({
        dashboard: false,
        services: false,
        leads: false,
        blogs: false,
        qrStats: false,
        adminAccess: false,
        scanner: false,
        scanLogs: false
      });
      alert('Sub-Admin account created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add account: ' + err.message);
    }
  };

  const handleDeleteAccount = async (docId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteDoc(doc(db, 'adminAccess', docId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete account: ' + err.message);
      }
    }
  };

  const handleDownloadMOU = (acc) => {
    const todayDate = new Date().toLocaleDateString('en-IN');
    const hospitalName = acc.name || 'HOSPITAL';
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; padding: 40px; color: #000;">
        <h2 style="text-align: center; text-decoration: underline; margin-bottom: 20px; font-size: 18px;">MEMORANDUM OF UNDERSTANDING (MOU)</h2>

        <p><strong>1. સંબંધની પ્રકૃતિ અને કાનૂની સ્થિતિ</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 1.1 આ MOU માત્ર માર્કેટિંગ ભાગીદારી અને પેશન્ટ રેફરલ સેવાઓ માટે જ છે.</li>
          <li>• 1.2 HRM એક સ્વતંત્ર માર્કેટિંગ ભાગીદાર છે. HRM એ હોસ્પિટલનું મેનેજમેન્ટ, વહીવટકર્તા, ઓપરેટર, ભાગીદાર કે માલિક નથી.</li>
          <li>• 1.3 કોઈ ક્લિનિકલ ભૂમિકા નહીં: હોસ્પિટલના કોઈપણ ક્લિનિકલ, તબીબી, વહીવટી, નાણાકીય અથવા ઓપરેશનલ કાર્યોમાં HRM ની કોઈ ભૂમિકા, અધિકાર કે જવાબદારી રહેશે નહીં. સારવારના તમામ નિર્ણયો, સારવારની ગુણવત્તા અને તબીબી પરિણામોની સંપૂર્ણ જવાબદારી માત્ર હોસ્પિટલની રહેશે.</li>
          <li>• 1.4 માલિક-કર્મચારી/એજન્સી સંબંધ નથી: આ MOU માં કંઈપણ પક્ષકારો વચ્ચે ભાગીદારી, સંયુક્ત સાહસ (Joint Venture), એજન્સી અથવા માલિક-કર્મચારીના સંબંધની રચના કરતું નથી.</li>
          <li>• 1.5 HRM ની સ્વતંત્રતા: હોસ્પિટલ સ્વીકારે છે કે HRM એક સ્વતંત્ર સંસ્થા છે અને તે માર્કેટિંગ પ્રવૃત્તિઓ અંગે હોસ્પિટલની કોઈપણ આંતરિક SOPs, નીતિઓ, નિયમો કે સૂચનાઓથી બંધાયેલ રહેશે નહીં. HRM પોતાની માર્કેટિંગ વ્યૂહરચના અને શરતો મુજબ કાર્ય કરશે.</li>
          <li>• 1.6 વૈધાનિક જાહેરાત: હોસ્પિટલ સ્વીકારે છે કે HRM એ CEA Act 2010, NMC Act 2019, અથવા IRDAI Act 1999 હેઠળ નોંધાયેલ નથી, તેથી HRM કોઈ ક્લિનિકલ સેવા પ્રદાન કરી શકશે નહીં અને કરશે પણ નહીં.</li>
        </ul>

        <p><strong>2. HRM દ્વારા આપવામાં આવતી સેવાઓનો વ્યાપ</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 2.1 દર્દી રેફરલ: HRM હોસ્પિટલમાં દર્દીઓ મોકલવા માટે તેના માર્કેટિંગ નેટવર્કનો ઉપયોગ કરશે. સૂચક ટાર્ગેટ: 30 સર્જિકલ + 70 OPD = 100 દર્દીઓ. એ સ્પષ્ટ કરવામાં આવે છે કે આ માત્ર એક લક્ષ્યાંક (Target) છે અને તેને પ્રાપ્ત કરવા માટે કોઈ નિશ્ચિત સમય મર્યાદા, ડેડલાઇન અથવા લઘુત્તમ ગેરંટી નથી.</li>
          <li>• 2.2 HRM Privilege Card: HRM તેના સભ્યોને પોતાનું માલિકીનું "HRM Privilege Card" ઈશ્યૂ કરશે. આ કાર્ડ માત્ર એક મેમ્બરશિપ કાર્ડ છે અને કોઈ વીમા (Insurance) પ્રોડક્ટ નથી.</li>
          <li>• 2.3 માર્કેટિંગ સપોર્ટ: HRM પોતાના ખર્ચે ડિજિટલ, પ્રિન્ટ અને ફિલ્ડ માર્કેટિંગ દ્વારા હોસ્પિટલનો પ્રચાર કરશે.</li>
          <li>• 2.4 પ્રાયોરિટી OPD: હોસ્પિટલ ડૉક્ટરની ઉપલબ્ધતા અને ઇમરજન્સી કેસોને આધીન, માન્ય HRM કાર્ડ ધરાવતા અને HRM દ્વારા રેફર કરાયેલા દર્દીઓને પ્રાથમિકતાના ધોરણે "Zero Waiting Time" (કોઈ રાહ જોયા વગર) OPD કન્સલ્ટેશન આપવા માટે સંમત થાય છે.</li>
        </ul>

        <p><strong>3. HRM Privilege Card – નીતિ અને મર્યાદાઓ</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 3.1 ડિસ્કાઉન્ટ માટેની પાત્રતા: આ MOU હેઠળ ડિસ્કાઉન્ટ ત્યારે જ લાગુ થશે જો દર્દી રજિસ્ટ્રેશન અથવા બિલિંગ સમયે અસલ અને માન્ય HRM Privilege Card રજૂ કરશે. કાર્ડ નહીં તો ડિસ્કાઉન્ટ નહીં.</li>
          <li>• 3.2 ડિસ્કાઉન્ટ માળખું: હોસ્પિટલ માત્ર નીચેની સેવાઓ પર 10% (દસ ટકા) ડિસ્કાઉન્ટ આપવા સંમત થાય છે:
            <br>&nbsp;&nbsp;&nbsp;&nbsp;a) દવાનું બિલ: માત્ર હોસ્પિટલની અંદરની (In-house) ફાર્મસી બિલિંગ પર.
            <br>&nbsp;&nbsp;&nbsp;&nbsp;b) In-house Diagnostic Report Bill: હોસ્પિટલની પોતાની લેબોરેટરી/રેડિયોલોજીમાં કરાયેલા ટેસ્ટ પર.
            <br>&nbsp;&nbsp;&nbsp;&nbsp;c) OPD Consultation Bill: માત્ર હોસ્પિટલના On-roll સ્ટાફ ડૉક્ટરોની કન્સલ્ટેશન ફી પર.
            <br>&nbsp;&nbsp;&nbsp;&nbsp;d) Surgery Bill: હોસ્પિટલના સર્જિકલ પેકેજ ચાર્જ પર.
          </li>
          <li>• 3.4 બિલિંગ પારદર્શિતા: હોસ્પિટલ પાત્ર સેવાઓ માટેના અંતિમ દર્દીના બિલમાં એક અલગ લાઇન આઇટમ તરીકે:
            <br><strong>“Less: 10% HRM Privilege Card BENEFITS – Rs. XXX”</strong>
            <br>નો સ્પષ્ટ ઉલ્લેખ કરશે. કમિશનની ગણતરી માટે આ ફરજિયાત છે.
          </li>
          <li>• 3.5 નિયમનકારી પાલન: જો કોઈ સરકારી સત્તાધિકારી HRM બ્રાન્ડિંગ અથવા કાર્ડ સામે વાંધો ઉઠાવશે, તો હોસ્પિટલ તેને પોતાના ખર્ચે તરત જ હટાવી દેશે અને HRM ની તેમાં કોઈ જવાબદારી રહેશે નહીં.</li>
        </ul>

        <div class="html2pdf__page-break"></div>

        <p><strong>4. વ્યાવસાયિક શરતો / આવકની વહેંચણી</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 4.1 ટ્રાયલ પિરિયડ (Trial Period): HRM દ્વારા રેફર કરાયેલા અને હોસ્પિટલ દ્વારા સફળતાપૂર્વક બિલ કરાયેલા પ્રથમ 100 (એકસો) દર્દીઓ માટે, HRM માર્કેટિંગ ફી તરીકે ₹0 (શૂન્ય રૂપિયા) ચાર્જ કરશે. આ પ્રોજેક્ટની સફળતા સાબિત કરવા માટે છે.</li>
          <li>• 4.2 ટ્રાયલ પછી આવકની વહેંચણી: 101મા દર્દીથી શરૂ કરીને, હોસ્પિટલ દરેક HRM-રેફર કરેલા દર્દીના Gross Billed Value ના 25% (પચ્ચીસ ટકા) માર્કેટિંગ ફી તરીકે HRM ને ચૂકવશે.</li>
          <li>• 4.3 ગણતરીનો આધાર: આ 25% ની ગણતરી 10% HRM Card Discount બાદ કરવામાં પહેલા અને GST ઉમેર્યા પહેલા ની કુલ રકમ પર કરવામાં આવશે.</li>
          <li>• 4.4 બિલિંગ અને પેમેન્ટ સાઇકલ: HRM દર મહિનાની 5મી તારીખ સુધીમાં અગાઉના મહિનાના રેફર કરાયેલા દર્દીઓ માટે GST Invoice (બિલ) મોકલશે. હોસ્પિટલ 10 (દસ) કેલેન્ડર દિવસની અંદર NEFT/RTGS દ્વારા Invoice ની ચુકવણી કરશે.</li>
          <li>• 4.5 દર્દીની ઓળખ: જે દર્દીઓના અંતિમ બિલમાં “HRM Privilege Card BENEFITS” ની લાઇન આઇટમ સામેલ હશે, તેમને જ HRM દ્વારા રેફર કરવામાં આવેલા દર્દી તરીકે ગણવામાં આવશે.</li>
        </ul>

        <p><strong>5. બ્રાન્ડિંગ, માર્કેટિંગ અને પાલન</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 5.1 પ્રારંભિક બ્રાન્ડિંગ ખર્ચ: હોસ્પિટલ પરિસરની અંદર HRM-મંજૂર બ્રાન્ડિંગ મટીરિયલની ડિઝાઇન અને ઇન્સ્ટોલેશનનો એક વખતનો ખર્ચ હોસ્પિટલ દ્વારા ભોગવવામાં આવશે. ડિઝાઇન HRM દ્વારા લેખિતમાં અગાઉથી મંજૂર થયેલી હોવી જોઈએ.</li>
          <li>• 5.2 ચાલુ માર્કેટિંગ ખર્ચ: પ્રારંભિક સેટઅપ પછી, હોસ્પિટલના પ્રમોશન માટેના તમામ ઓનલાઇન/ઓફલાઇન માર્કેટિંગ, ઝુંબેશ (Campaign) અને જાહેરાતોનો 100% ખર્ચ HRM દ્વારા ભોગવવામાં આવશે.</li>
          <li>• 5.3 હોસ્પિટલ દ્વારા આપવાની વિગતો: સાઇન કર્યાના 7 દિવસની અંદર, હોસ્પિટલ HRM ને આ વિગતો આપશે:
            <br>&nbsp;&nbsp;&nbsp;&nbsp;a) હોસ્પિટલનો High Resolution Logo
            <br>&nbsp;&nbsp;&nbsp;&nbsp;b) લાયકાત સાથે On-roll Staff Doctors ની યાદી
            <br>&nbsp;&nbsp;&nbsp;&nbsp;c) સેવાઓ/વિભાગોની યાદી
            <br>&nbsp;&nbsp;&nbsp;&nbsp;d) CEA Registration Certificate ની નકલ
            <br>&nbsp;&nbsp;&nbsp;&nbsp;AND ALL GP’S LIST WITH CONTACT NUMBER
          </li>
          <li>• 5.4 બ્રાન્ડિંગ પાલન - ફરજિયાત: તમામ બ્રાન્ડિંગ સખત રીતે CEA Act, 2010, IRDAI નિયમો અને NMC માર્ગદર્શિકાનું પાલન કરશે. પક્ષકારો નીચેની બાબતો પર સંમત થાય છે:
            <br>&nbsp;&nbsp;&nbsp;&nbsp;a) પ્રાથમિક બ્રાન્ડિંગ:<br>
            હોસ્પિટલનું નામ "<strong>${hospitalName}</strong>" બિલ્ડિંગ પર હંમેશા સૌથી મોટું અને ટોચ પરનું Signage રહેશે.<br>
            <br>&nbsp;&nbsp;&nbsp;&nbsp;b) HRM બ્રાન્ડિંગ:<br>
            HRM બ્રાન્ડિંગ માત્ર Ground Floor / Reception Level પર જ<br>
            "Powered by HRM Consultancy" અથવા "HRM Network Partner: HRM Consultancy"<br>
            લખાણ સાથે દેખાશે.<br>
            HRM બ્રાન્ડિંગના ફૉન્ટનું કદ હોસ્પિટલના મુખ્ય નામ બોર્ડના 50% થી વધુ હોવું જોઈએ નહીં.<br>
            <br>&nbsp;&nbsp;&nbsp;&nbsp;c) ફરજિયાત Disclaimer (અસ્વીકરણ):<br>
            દરેક માર્કેટિંગ સામગ્રીમાં આ લખાણ હોવું જ જોઈએ:<br>
            “HRM Privilege Card માત્ર એક Discount Membership Card છે. વીમા પ્રોડક્ટ નથી. IRDAI દ્વારા નિયંત્રિત નથી. તમામ તબીબી સેવાઓ અને જવાબદારીઓ માત્ર હોસ્પિટલની છે. HRM માત્ર એક માર્કેટિંગ Facilitator (મદદકર્તા) છે.”
          </li>
        </ul>

        <div class="html2pdf__page-break"></div>

        <p><strong>6. વૈધાનિક પાલન અને લાઇસન્સ જાહેરાત - પૂર્વ શરત</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 6.1 Annexure-A:<br>
            હોસ્પિટલ "Annexure-A: Hospital License Checklist" ભરીને, સહી કરીને અને સિક્કો મારીને HRM ને સબમિટ કરશે. આ MOU માટે આ એક ફરજિયાત પૂર્વ શરત છે.</li>
          <li>• 6.2 લેવલ 1 ફરજિયાત (LEVEL 1 Mandatory):<br>
            જો Annexure-A ના "LEVEL 1" હેઠળ સૂચિબદ્ધ કોઈપણ એક License/Document ગુમ હોય, અમાન્ય હોય અથવા તેની મુદત પૂર્ણ થઈ ગઈ હોય, તો હોસ્પિટલએ તરત જ HRM ને લેખિતમાં તેની જાણ કરવી પડશે.</li>
          <li>• 6.3 HRM નો નકારવાનો અધિકાર:<br>
            Annexure-A મળ્યા પછી, HRM 3 કાર્યકારી દિવસોમાં લેખિતમાં<br>
            "YES - MOU Active" અથવા "NO - MOU Not Active due to ____ license missing" સાથે જવાબ આપશે.<br>
            આ MOU ત્યારે જ અમલમાં આવશે જ્યારે HRM લેખિતમાં "YES" આપશે. માત્ર MOU પર સહી કરવાથી તે સક્રિય (Effective) બનતું નથી.</li>
          <li>• 6.4 સખત પાલન:<br>
            હોસ્પિટલ ખાતરી આપે છે કે તે આ MOU ની મુદત દરમિયાન તમામ LEVEL 1 Licenses માન્ય રાખશે અને તેની મુદત પૂર્ણ થવાના 15 દિવસ પહેલા HRM ને Renew કરાયેલી નકલો આપશે.</li>
        </ul>

        <p><strong>7. મુદત, સમાપ્તિ અને Lock-in</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 7.1 મુદત: આ MOU ઉપર નિર્દિષ્ટ કરેલી HRM ના લેખિત "YES" ની તારીખથી 36 મહિનાં માટે માન્ય રહેશે.</li>
          <li>• 7.2 Lock-in: Activation પછીના પ્રથમ 3 મહિના Lock-in Period રહેશે. ગંભીર ઉલ્લંઘન સિવાય આ સમય દરમિયાન કરાર સમાપ્ત કરી શકાશે નહીં.</li>
          <li>• 7.3 સમાપ્તિ (Termination): Lock-in Period પછી, કોઈપણ પક્ષ બીજા પક્ષને 30 (ત્રીસ) દિવસની લેખિત Notice આપીને આ MOU સમાપ્ત કરી શકશે.</li>
          <li>• 7.4 HRM દ્વારા તાત્કાલિક સમાપ્તિ: HRM આ કરારને તરત જ સમાપ્ત કરી શકશે જો:<br>
            a) હોસ્પિટલનું CEA License રદ/સ્થગિત થાય.<br>
            b) હોસ્પિટલ જરૂરી Licenses ની શરતોનું ઉલ્લંઘન કરે.<br>
            c) દર્શાવેલ શરતો મુજબ ગંભીર ઉલ્લંઘન થાય.</li>
          <li>• 7.5 સમાપ્તિના પરિણામો: કરાર સમાપ્ત થવા પર હોસ્પિટલ:<br>
            a) 7 દિવસની અંદર તમામ HRM બ્રાન્ડિંગ હટાવી દેશે.<br>
            b) 15 દિવસની અંદર HRM ની તમામ બાકી રકમ ચૂકવી દેશે.<br>
            c) અગાઉથી દાખલ થયેલા દર્દીઓ માટે HRM Card Discount ચાલુ રાખશે.</li>
        </ul>

        <div class="html2pdf__page-break"></div>

        <p><strong>8. નુકસાની વળતર, જવાબદારી અને વીમો</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 8.1 હોસ્પિટલની વળતર જવાબદારી: હોસ્પિટલ આથી HRM, તેના Proprietor, કર્મચારીઓ અને Agents ને નીચેની બાબતોથી થતા તમામ દાવાઓ, નુકસાન, જવાબદારીઓ અને ખર્ચોથી મુક્ત રાખશે અને વળતર આપશે:<br>
            a) Medical Negligence, સેવામાં ખામી અથવા Medico-Legal કેસો.<br>
            b) હોસ્પિટલ અથવા તેના Doctors/Staff નું કોઈપણ કૃત્ય અથવા બેદરકારી.<br>
            c) હોસ્પિટલ દ્વારા CEA, NMC, IRDAI, Consumer Protection Act સહિતના કોઈપણ કાયદાનું ઉલ્લંઘન.</li>
          <li>• 8.2 HRM ની મર્યાદિત જવાબદારી: આ MOU હેઠળ HRM ની મહત્તમ જવાબદારી, જો કોઈ હોય તો, અગાઉના 3 મહિનામાં હોસ્પિટલ પાસેથી મળેલી માર્કેટિંગ ફી પૂરતી મર્યાદિત રહેશે. કોઈપણ તબીબી પરિણામ, દર્દીના મૃત્યુ અથવા ક્લિનિકલ જટિલતાઓ માટે HRM જવાબદાર રહેશે નહીં.</li>
          <li>• 8.3 વીમો: હોસ્પિટલ રજૂઆત કરે છે કે તેની પાસે તેના ડૉક્ટરો અને હોસ્પિટલને આવરી લેતો માન્ય Professional Indemnity Insurance છે.</li>
          <li>• 8.4 ડેટા પ્રોટેક્શન (માહિતી સુરક્ષા): દર્દીના તબીબી રેકોર્ડ, સારવારના ડેટા અને બિલિંગ ડેટા હોસ્પિટલની વિશિષ્ટ કસ્ટડીમાં રહેશે. Digital Personal Data Protection Act, 2023 નું પાલન સુનિશ્ચિત કરવા માટે HRM ને ક્લિનિકલ ડેટાની ઍક્સેસ મળશે નહીં.</li>
        </ul>

        <p><strong>9. ગોપનીયતા અને બાયપાસ ન કરવાની શરત</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 9.1 પક્ષકારો તમામ વ્યાવસાયિક શરતો ગુપ્ત રાખશે.</li>
          <li>• 9.2 હોસ્પિટલ સંમત થાય છે કે આ કરારની મુદત દરમિયાન અને તે પછીના 12 મહિના સુધી, HRM ને બાયપાસ કરવા (કમિશન બચાવવા) માટે તે HRM ના રેફર કરેલા દર્દીઓ અથવા કોર્પોરેટ ક્લાયન્ટ્સનો સીધો સંપર્ક કરશે નહીં.</li>
        </ul>

        <p><strong>10. વિવાદ નિવારણ અને અધિકારક્ષેત્ર</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 10.1 પક્ષકારો પહેલા 15 દિવસની અંદર પરસ્પર વિવાદોને સૌહાર્દપૂર્ણ રીતે ઉકેલવાનો પ્રયાસ કરશે.</li>
          <li>• 10.2 જો ઉકેલ ન આવે, તો વિવાદો માત્ર રાજકોટ, ગુજરાતની અદાલતોના વિશિષ્ટ અધિકારક્ષેત્રને આધીન રહેશે. આમાં Arbitration (મધ્યસ્થતા) લાગુ થશે નહીં.</li>
        </ul>

        <p><strong>11. પરચૂરણ</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• 11.1 સંપૂર્ણ કરાર: આ MOU અને સાથે સામેલ Checklist એ સંપૂર્ણ કરાર બનાવે છે અને અગાઉની તમામ ચર્ચાઓનું સ્થાન લે છે.</li>
          <li>• 11.2 સુધારો: કોઈપણ સુધારો લેખિતમાં હોવો જોઈએ અને બંને પક્ષો દ્વારા સહી થયેલો હોવો જોઈએ.</li>
          <li>• 11.3 નોટિસ: તમામ Notices ઉપર દર્શાવેલા સરનામે Registered Post AD અથવા Email દ્વારા મોકલવામાં આવશે.</li>
          <li>• 11.4 વિભાજ્યતા (Severability): જો કોઈ કલમ અમાન્ય ઠરે, તો પણ બાકીનું MOU અમલમાં રહેશે.</li>
          <li>• 11.5 Force Majeure (અનિવાર્ય સંજોગો): કુદરતી આપત્તિઓ, મહામારી, સરકારી આદેશો અથવા અન્ય અનિવાર્ય કારણોસર કામગીરીમાં નિષ્ફળતા માટે કોઈપણ પક્ષ જવાબદાર રહેશે નહીં.</li>
        </ul>

        <p>જેના સાક્ષી તરીકે, પક્ષકારોએ ઉપર જણાવેલ તારીખે આ MOU નો અમલ કર્યો છે.</p>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid;">
          <div style="width: 45%;">
            <strong>હોસ્પિટલ વતી (For ${hospitalName})</strong><br><br>
            અધિકૃત હસ્તાક્ષરકર્તા<br><br>
            નામ: ______________________<br><br>
            હોદ્દો: ______________________<br><br>
            તારીખ: ${todayDate}<br><br>
            સિક્કો:
          </div>
          <div style="width: 45%;">
            <strong>એચ.આર.એમ. કન્સલ્ટન્સી ડોક્ટર્સ ચોઈસ વતી<br>(For HRM CONSULTANCY DOCTORS CHOICE)</strong><br><br>
            અધિકૃત હસ્તાક્ષરકર્તા<br><br>
            નામ: શ્રી નીરવ પુંડયા<br><br>
            હોદ્દો: પ્રોપ્રાઈટર<br><br>
            તારીખ: ${todayDate}<br><br>
            સિક્કો:
          </div>
        </div>
      </div>
    `;
    
    const opt = {
      margin:       10,
      filename:     `MOU_${hospitalName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: 'css', before: '.html2pdf__page-break' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const handleExportCSV = () => {
    if (qrUsers.length === 0) {
      alert('No data to export.');
      return;
    }
    
    const headers = ['Email', 'Role/Type', 'Referred By Card ID'];
    const rows = qrUsers.map(u => [
      u.email,
      u.type || 'user',
      u.referredByCardId
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${adminName.replace(/\s+/g, '_')}_QR_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminCardId');
    localStorage.removeItem('adminPermissions');
    navigate('/admin/login', { replace: true });
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Helper – Super Admin has all permissions; sub-admins only what's in their array
  const hasPermission = (key) => permissions.includes(key);

  return (
    <div className="admin-dashboard-layout">

      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo-img-wrap">
            <img src="/logo.jpeg" alt="HRM" className="admin-sidebar-brand-logo" />
          </div>
          <div>
            <div className="admin-sidebar-title">HRM Admin</div>
            <div className="admin-sidebar-subtitle">Control Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Main</div>

          {hasPermission('dashboard') && (
            <Link to="/admin/dashboard" className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <IconDashboard /> Overview
            </Link>
          )}
          {hasPermission('services') && (
            <a href="/admin/services" className="admin-nav-item">
              <IconClipboard /> Service Submissions
            </a>
          )}

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          {hasPermission('leads') && (
            <a href="/admin/leads" className="admin-nav-item">
              <IconUsers /> Users & Leads
            </a>
          )}
          {hasPermission('blogs') && (
            <a href="/admin/blogs" className="admin-nav-item">
              <IconEdit /> Blog Manager
            </a>
          )}
          {hasPermission('qrStats') && (
            <Link to="/admin/dashboard?tab=qr-stats" className={`admin-nav-item ${activeTab === 'qr-stats' ? 'active' : ''}`} onClick={() => setActiveTab('qr-stats')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              QR Stats
            </Link>
          )}
          {hasPermission('adminAccess') && (
            <Link to="/admin/dashboard?tab=accounts" className={`admin-nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Access
            </Link>
          )}
          {hasPermission('scanner') && (
            <Link to="/admin/dashboard?tab=scanner" className={`admin-nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
              </svg>
              Card Scanner
            </Link>
          )}
          {hasPermission('scanLogs') && (
            <Link to="/admin/dashboard?tab=scan-logs" className={`admin-nav-item ${activeTab === 'scan-logs' ? 'active' : ''}`} onClick={() => setActiveTab('scan-logs')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Scan Logs
            </Link>
          )}
          {hasPermission('dashboard') && (
            <Link to="/admin/dashboard?tab=activation" className={`admin-nav-item ${activeTab === 'activation' ? 'active' : ''}`} onClick={() => setActiveTab('activation')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Card Activation / Renew
            </Link>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => window.open('/', '_blank')} className="admin-visit-btn">
            <IconGlobe /> Visit Website
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main className="admin-main-content">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'accounts' ? 'Admin Access' : activeTab === 'scanner' ? 'Card Scanner' : activeTab === 'scan-logs' ? 'Scan Logs' : activeTab === 'activation' ? 'Card Activation & Renewals' : 'QR Registration Stats'}</h1>
            <p>HRM Doctors Choice — Admin Panel ({adminName})</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-live-badge">
              <div className="admin-live-dot" /> Live
            </div>
            <span className="admin-topbar-time">{currentTime}</span>
            <div className="admin-topbar-avatar">{adminName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="admin-content-area">

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && hasPermission('dashboard') && (
            <>
              {/* Stats */}
              <div>
                <div className="admin-section-header">
                  <div className="admin-section-title">Platform Statistics</div>
                </div>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card red">
                    <div className="admin-stat-icon-wrap red"><IconUserStat /></div>
                    <div className="admin-stat-label">Total Users</div>
                    <div className="admin-stat-value">{totalUsers}</div>
                    <div className="admin-stat-sub">Registered on platform</div>
                  </div>
                  <div className="admin-stat-card green">
                    <div className="admin-stat-icon-wrap green"><IconTrendUp /></div>
                    <div className="admin-stat-label">New Registrations</div>
                    <div className="admin-stat-value">{newRegs}</div>
                    <div className="admin-stat-sub">Last 7 days</div>
                  </div>
                  <div className="admin-stat-card amber">
                    <div className="admin-stat-icon-wrap amber"><IconZap /></div>
                    <div className="admin-stat-label">Active Sessions</div>
                    <div className="admin-stat-value">{activeSessions}</div>
                    <div className="admin-stat-sub">Estimated live users</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="admin-section-header">
                  <div className="admin-section-title">Quick Actions</div>
                </div>
                <div className="admin-quick-actions">
                  {hasPermission('services') && (
                    <a href="/admin/services" className="admin-action-card">
                      <div className="admin-action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1"/>
                        </svg>
                      </div>
                      <div className="admin-action-text">
                        <h4>Service Submissions</h4>
                        <p>View & export client data</p>
                      </div>
                    </a>
                  )}

                  {hasPermission('leads') && (
                    <a href="/admin/leads" className="admin-action-card">
                      <div className="admin-action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                      </div>
                      <div className="admin-action-text">
                        <h4>Manage Users</h4>
                        <p>View all registered users</p>
                      </div>
                    </a>
                  )}

                  {hasPermission('blogs') && (
                    <a href="/admin/blogs" className="admin-action-card">
                      <div className="admin-action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </div>
                      <div className="admin-action-text">
                        <h4>Blog Manager</h4>
                        <p>Create & manage blog posts</p>
                      </div>
                    </a>
                  )}

                  <a href="/" target="_blank" rel="noreferrer" className="admin-action-card">
                    <div className="admin-action-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                      </svg>
                    </div>
                    <div className="admin-action-text">
                      <h4>Visit Website</h4>
                      <p>Open the public portal</p>
                    </div>
                  </a>
                </div>
              </div>
            </>
          )}

          {/* 2. ADMIN ACCESS MANAGEMENT TAB */}
          {activeTab === 'accounts' && hasPermission('adminAccess') && (
            <div className="admin-accounts-layout">
              {/* Form card */}
              <div className="admin-form-card">
                <h3 className="admin-form-title">Create Sub-Admin Account</h3>
                <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="admin-input-group">
                    <label>Username / Admin ID *</label>
                    <input 
                      type="text" 
                      className="admin-text-input" 
                      placeholder="e.g. apollo_hospital" 
                      value={newUsername} 
                      onChange={e => setNewUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Password *</label>
                    <input 
                      type="password" 
                      className="admin-text-input" 
                      placeholder="Enter password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      className="admin-text-input" 
                      placeholder="e.g. Apollo Hospital" 
                      value={newDisplayName} 
                      onChange={e => setNewDisplayName(e.target.value)} 
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Permissions Access</label>
                    <div className="admin-checkbox-list">
                      {Object.keys(newPermissions).map(key => (
                        <label key={key} className="admin-checkbox-item">
                          <input 
                            type="checkbox" 
                            checked={newPermissions[key]} 
                            onChange={e => setNewPermissions({...newPermissions, [key]: e.target.checked})} 
                          />
                          <span>{key === 'dashboard' ? 'Dashboard / Overview' : key === 'qrStats' ? 'QR Registration Stats' : key === 'adminAccess' ? 'Admin Access Manager' : key === 'scanner' ? 'Card Scanner (Hospital)' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="admin-submit-btn">Create Account</button>
                </form>
              </div>

              {/* Table card */}
              <div className="admin-table-card">
                <h3 className="admin-form-title" style={{ marginBottom: '16px' }}>Manage Sub-Admin Accounts</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Display Name</th>
                      <th>Username</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id}>
                        <td><strong>{acc.name || 'Unnamed'}</strong></td>
                        <td>{acc.username}</td>
                        <td>
                          {(acc.permissions || []).map(p => (
                            <span key={p} className="admin-perm-badge">{p}</span>
                          ))}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleDownloadMOU(acc)} className="admin-submit-btn" style={{ padding: '6px 12px', fontSize: '11px', background: '#3498db', borderColor: '#3498db' }} title="Download Partner MOU PDF">
                              Download MOU
                            </button>
                            <button onClick={() => handleDeleteAccount(acc.id)} className="admin-delete-btn" title="Delete Account">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {accounts.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--ad-text-3)' }}>
                          No sub-admin accounts configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. QR REGISTRATION STATS TAB */}
          {activeTab === 'qr-stats' && hasPermission('qrStats') && (
            <div className="qr-stats-layout">
              {/* Sidebar stats/QR display */}
              <div className="qr-stats-sidebar">
                <h3 className="admin-form-title">Your QR Codes</h3>
                
                {adminCardId ? (
                  <>
                    {/* Dark metallic card preview */}
                    <div className="admin-id-card-mini">
                      <div className="admin-id-card-mini-metal" />
                      <div className="admin-id-mini-logo-row">
                        <img src="/logo.png" alt="HRM" className="admin-id-mini-logo" />
                      </div>
                      <p className="admin-id-mini-tagline">HRM CONSULTANCY · VOLUTORS CHOICE</p>
                      <div className="admin-id-mini-qr">
                        <div style={{ background: '#fff', padding: 8, borderRadius: 6, display: 'inline-block' }}>
                          <QRCodeCanvas 
                            value={`https://myhrm.co.in/verify/${adminCardId}`} 
                            size={100} 
                            level="H"
                          />
                        </div>
                      </div>
                      <div className="admin-id-mini-detail">
                        <span className="admin-id-mini-label">HRM ID:</span>
                        <span className="admin-id-mini-value">{adminCardId}</span>
                      </div>
                      <div className="admin-id-mini-detail">
                        <span className="admin-id-mini-label">Name:</span>
                        <span className="admin-id-mini-value">{adminName}</span>
                      </div>
                      <div className="admin-id-mini-footer">www.myhrm.co.in</div>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--ad-text-3)', margin: 0, textAlign: 'center' }}>
                      Verification QR linked to Card ID: <code style={{ color: '#e74c3c' }}>{adminCardId}</code>
                    </p>

                    <div className="admin-nav-divider" style={{ width: '100%', margin: '10px 0' }} />

                    <div className="qr-info-box">
                      <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ad-text-3)' }}>
                        Direct Registration Link
                      </label>
                      <div className="qr-link-copy">
                        <input 
                          type="text" 
                          readOnly 
                          value={`https://myhrm.co.in/portal/user/register?ref=${adminCardId}`} 
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://myhrm.co.in/portal/user/register?ref=${adminCardId}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }} 
                          className="qr-copy-btn"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                        Share this link or print a QR code with this URL to track direct registrations.
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--ad-text-3)', fontSize: '13px' }}>
                    No Privilege ID Card is linked to this account. Contact Super Admin to link a Card ID.
                  </p>
                )}
              </div>

              {/* Stats Table */}
              <div className="admin-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="admin-form-title" style={{ margin: 0 }}>QR Code Registrations</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                      Registered members tracked via your privilege card QR code.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--ad-accent-dim)', color: '#e74c3c', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>
                      Total: {qrUsers.length}
                    </div>
                    <button onClick={handleExportCSV} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                      Export Leads (CSV)
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Account Type</th>
                      <th>Tracking ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.email}</strong></td>
                        <td>
                          <span className="admin-perm-badge" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }}>
                            {user.type || 'user'}
                          </span>
                        </td>
                        <td><code>{user.referredByCardId}</code></td>
                      </tr>
                    ))}
                    {qrUsers.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
                          No users registered using your QR code yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SCANNER TAB */}
          {activeTab === 'scanner' && hasPermission('scanner') && (
            <div className="admin-scanner-layout" style={{ height: '100%' }}>
              <CardScanner />
            </div>
          )}

          {/* 4.5. SCAN LOGS TAB */}
          {activeTab === 'scan-logs' && hasPermission('scanLogs') && (
            <div className="admin-table-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="admin-form-title" style={{ margin: 0 }}>Card Scan Logs</h3>
                  <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                    History of patient cards scanned by hospitals.
                  </p>
                </div>
                <button onClick={fetchScanLogs} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                  Refresh Logs
                </button>
              </div>

              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-3)' }}>
                  Loading scan logs...
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Hospital Name</th>
                        <th>Patient Name</th>
                        <th>Card ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanLogs.map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.scanned_at).toLocaleString('en-IN')}</td>
                          <td><strong>{log.hospital_name}</strong><div style={{ fontSize: '11px', color: 'var(--ad-text-3)' }}>@{log.hospital_username}</div></td>
                          <td>{log.patient_name}</td>
                          <td><code>{log.card_id}</code></td>
                          <td>
                            <span className="admin-perm-badge" style={{ 
                              background: log.status === 'valid' ? 'rgba(46, 204, 113, 0.15)' : log.status === 'expired' ? 'rgba(243, 156, 18, 0.15)' : 'rgba(231, 76, 60, 0.15)', 
                              color: log.status === 'valid' ? '#2ecc71' : log.status === 'expired' ? '#f39c12' : '#e74c3c' 
                            }}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {scanLogs.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
                            No scan logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. CARD ACTIVATION / RENEWAL TAB */}
          {activeTab === 'activation' && hasPermission('dashboard') && (
            <div className="activation-tab-layout">
              {/* Stats Panel */}
              <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="admin-stat-card red">
                  <div className="admin-stat-label">Total Cards</div>
                  <div className="admin-stat-value">{privilegeCards.length}</div>
                  <div className="admin-stat-sub">Generated privilege cards</div>
                </div>
                <div className="admin-stat-card amber">
                  <div className="admin-stat-label">Pending Approval</div>
                  <div className="admin-stat-value" style={{ color: '#f39c12' }}>
                    {privilegeCards.filter(c => c.card_status === 'PENDING_ACTIVATION').length}
                  </div>
                  <div className="admin-stat-sub">Reactivation / renewal requests</div>
                </div>
                <div className="admin-stat-card green">
                  <div className="admin-stat-label">Active Cards</div>
                  <div className="admin-stat-value" style={{ color: '#2ecc71' }}>
                    {privilegeCards.filter(c => c.card_status === 'ACTIVE').length}
                  </div>
                  <div className="admin-stat-sub">Active members</div>
                </div>
              </div>

              {/* Privilege Cards Table */}
              <div className="admin-table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 className="admin-form-title" style={{ margin: 0 }}>Privilege ID Cards Management</h3>
                    <p style={{ fontSize: '12px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                      Activate, renew, deactivate, or delete user privilege cards.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Search ID, Name or City..." 
                      value={cardSearch} 
                      onChange={e => setCardSearch(e.target.value)}
                      className="admin-text-input"
                      style={{ padding: '8px 12px', width: '220px', fontSize: '13px' }}
                    />
                    <button onClick={fetchPrivilegeCards} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                      Refresh
                    </button>
                  </div>
                </div>

                {cardsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-3)' }}>
                    Loading cards data...
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name / Contact</th>
                        <th>HRM ID</th>
                        <th>Location</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {privilegeCards
                        .filter(card => {
                          const s = cardSearch.toLowerCase();
                          return (
                            (card.name && card.name.toLowerCase().includes(s)) ||
                            (card.id_no && card.id_no.toLowerCase().includes(s)) ||
                            (card.city && card.city.toLowerCase().includes(s)) ||
                            (card.mobile && card.mobile.includes(s))
                          );
                        })
                        .map(card => (
                          <tr key={card.id}>
                            <td>
                              {card.photo_url ? (
                                <img 
                                  src={card.photo_url} 
                                  alt="" 
                                  style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--ad-border)' }} 
                                />
                              ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                                  No Photo
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{card.name}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '2px' }}>{card.mobile || 'No Mobile'}</div>
                            </td>
                            <td><code>{card.id_no}</code></td>
                            <td>{card.city || '—'}</td>
                            <td>
                              <div style={{ fontSize: '12px' }}>Join: {card.join_date}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '2px' }}>Exp: {card.expire_date}</div>
                            </td>
                            <td>
                              {card.card_status === 'ACTIVE' && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }}>
                                  ACTIVE
                                </span>
                              )}
                              {card.card_status === 'PENDING_ACTIVATION' && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', animation: 'pulse 2s infinite' }}>
                                  PENDING APPROVAL
                                </span>
                              )}
                              {(card.card_status === 'INACTIVE' || !card.card_status) && (
                                <span className="admin-perm-badge" style={{ background: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6' }}>
                                  INACTIVE
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {card.card_status !== 'ACTIVE' ? (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#2ecc71', borderColor: '#2ecc71' }}
                                  >
                                    Approve / Activate
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#3498db', borderColor: '#3498db' }}
                                  >
                                    Renew (1 Yr)
                                  </button>
                                )}
                                
                                {card.card_status === 'ACTIVE' && (
                                  <button 
                                    onClick={() => handleDeactivateCard(card.id_no)} 
                                    className="admin-delete-btn" 
                                    style={{ padding: '4px 8px', fontSize: '11px', background: '#e67e22', color: '#fff' }}
                                  >
                                    Deactivate
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDeleteCard(card.id_no)} 
                                  className="admin-delete-btn" 
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {privilegeCards.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
                            No privilege cards found in database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
