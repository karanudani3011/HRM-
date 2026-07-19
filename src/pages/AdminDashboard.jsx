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
    adminAccess: false,
    scanner: false,
    scanLogs: false,
    activation: false
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

  // Patient Bills state
  const [patientBills, setPatientBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billForm, setBillForm] = useState({ hospitalName: '', patientName: '', hrmId: '', billAmount: '', discount: '', afterDiscount: '', billDate: '' });
  const [selectedHospitalBill, setSelectedHospitalBill] = useState(null); // bill revealed on double-click
  const [billSubmitSuccess, setBillSubmitSuccess] = useState(false);

  const fetchPatientBills = async () => {
    setBillsLoading(true);
    try {
      let query = supabase.from('patient_bills').select('*').order('created_at', { ascending: false });
      if (adminUsername !== 'admin') {
        query = query.eq('hospital_username', adminUsername);
      }
      const { data, error } = await query;
      if (error) throw error;
      setPatientBills(data || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setBillsLoading(false);
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    const { hospitalName, patientName, hrmId, billAmount, discount, billDate } = billForm;
    if (!hospitalName || !patientName || !hrmId || !billAmount || !billDate) {
      return alert('Please fill all required fields.');
    }
    setBillsLoading(true);
    try {
      const amt = parseFloat(billAmount) || 0;
      let finalDiscount = 0;
      if (String(discount).includes('%')) {
        finalDiscount = (amt * parseFloat(discount)) / 100;
      } else {
        finalDiscount = parseFloat(discount) || 0;
      }
      const finalAfterDiscount = amt - finalDiscount;

      const { error: dbError } = await supabase.from('patient_bills').insert([{
        hospital_name: hospitalName,
        hospital_username: adminUsername,
        patient_name: patientName,
        hrm_id: hrmId,
        bill_amount: amt,
        discount: finalDiscount,
        after_discount: finalAfterDiscount > 0 ? finalAfterDiscount : 0,
        bill_date: billDate,
        file_url: "" // Provide default to fix the not-null constraint
      }]);

      if (dbError) throw dbError;

      setBillSubmitSuccess(true);
      setBillForm({ hospitalName: '', patientName: '', hrmId: '', billAmount: '', discount: '', afterDiscount: '', billDate: '' });
      fetchPatientBills();
      setTimeout(() => setBillSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting bill:', err);
      alert('Error submitting bill: ' + err.message);
    } finally {
      setBillsLoading(false);
    }
  };

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
    if (activeTab === 'patient-bills') {
      fetchPatientBills();
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
        adminAccess: false,
        scanner: false,
        scanLogs: false,
        activation: false
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
        <h2 style="text-align: center; text-decoration: underline; margin-bottom: 20px; font-size: 18px;">NETWORK HOSPITAL PARTNERSHIP AGREEMENT</h2>

        <p><strong>Version: 3.0</strong><br>
        <strong>Effective Date:</strong> આ કરાર HRM Consultancy દ્વારા Hospital ની અરજી મંજૂર (Approved) કરવામાં આવે તે તારીખથી અમલમાં આવશે.</p>

        <p><strong>1. DEFINITIONS (વ્યાખ્યાઓ)</strong><br>
        આ કરારમાં, સંદર્ભ અન્યથા ન માંગતો હોય ત્યાં સુધી નીચેના શબ્દોનો અર્થ નીચે મુજબ રહેશે:<br>
        1.1 HRM: HRM Consultancy, Rajkot, Gujarat, જે PRIVY League Card Membership Program નું સંચાલન કરે છે.<br>
        1.2 Hospital: આ કરાર સ્વીકારી HRM દ્વારા Network Hospital તરીકે મંજૂર કરવામાં આવેલ હોસ્પિટલ અથવા આરોગ્યસેવા સંસ્થા.<br>
        1.3 Membership Card: HRM દ્વારા જારી કરવામાં આવેલ PRIVY League Card.<br>
        1.4 Card Holder / Member: માન્ય Membership Card ધરાવતી વ્યક્તિ.<br>
        1.5 Rahat (Benefit): Hospital દ્વારા આ કરાર અને પોતાની જાહેર કરેલી નીતિ મુજબ સભ્યને આપવામાં આવતો લાભ અથવા રાહત.<br>
        1.6 Platform: HRM ની Website, Mobile Application, Dashboard અને અન્ય અધિકૃત ડિજિટલ માધ્યમો.<br>
        1.7 Effective Date: HRM દ્વારા Hospital ને Approved Partner તરીકે સ્વીકાર્યાની તારીખ.<br>
        1.8 Services: HRM દ્વારા Membership Program નું સંચાલન, Hospital Listing, સભ્યપદ સંબંધિત માહિતી, Branding Support અને અન્ય સંબંધિત સેવાઓ.</p>

        <p><strong>2. PURPOSE AND SCOPE OF PARTNERSHIP</strong><br>
        2.1 આ કરારનો હેતુ HRM અને Hospital વચ્ચે PRIVY League Card Membership Program સંબંધિત સહયોગ માટેની શરતો નક્કી કરવાનો છે.<br>
        2.2 HRM Membership Program નું સંચાલન અને Hospital Listing સંબંધિત સેવાઓ પૂરી પાડશે.<br>
        2.3 Hospital પોતાની નીતિ અને આ કરાર મુજબ પાત્ર સભ્યોને જાહેર કરાયેલ લાભ અથવા રાહત ઉપલબ્ધ કરાવશે.<br>
        2.4 આ કરારનો અર્થ કોઈ Referral Agreement, Patient Procurement Agreement, Employment, Partnership Firm, Joint Venture અથવા Agency Agreement તરીકે કરવામાં આવશે નહીં.<br>
        2.5 દરેક પક્ષ પોતાની સેવાઓ, કર્મચારીઓ, કરવેરા, લાઇસન્સ અને વ્યવસાયિક જવાબદારીઓ માટે સ્વતંત્ર રહેશે.</p>

        <p><strong>3. RESPONSIBILITIES OF HRM</strong><br>
        HRM યોગ્ય પ્રયત્નો સાથે નીચેની સેવાઓ પૂરી પાડશે:<br>
        3.1 PRIVY League Card Membership Program નું સંચાલન અને સભ્યપદ પ્રક્રિયાનું વહીવટ.<br>
        3.2 મંજૂર થયેલા Hospital ને HRM Platform પર Network Hospital તરીકે દર્શાવવું.<br>
        3.3 Hospital ને Login Credentials, Branding Guidelines અને સંબંધિત Digital Materials ઉપલબ્ધ કરાવવું.<br>
        3.4 Program સંબંધિત સામાન્ય ગ્રાહક સહાય પોતાની જાહેર કરેલી Support Policy મુજબ ઉપલબ્ધ કરાવવી.<br>
        3.5 Program સંબંધિત માહિતી, પ્રક્રિયા અથવા ઓપરેશનલ માર્ગદર્શિકામાં વાજબી ફેરફાર કરવાની જરૂર પડે તો Hospital ને યોગ્ય રીતે જાણ કરવી.<br>
        3.6 HRM કોઈપણ દર્દીને ચોક્કસ Hospital પાસે સારવાર લેવા માટે દબાણ કરશે નહીં અથવા કોઈ સારવારની ભલામણ કરશે નહીં.</p>

        <p><strong>4. RESPONSIBILITIES OF THE HOSPITAL</strong><br>
        Hospital નીચે મુજબ સંમત થાય છે:<br>
        4.1 આ કરાર અને પોતાની જાહેર કરેલી નીતિ મુજબ પાત્ર Card Holder ને ઉપલબ્ધ લાભ અથવા રાહત આપશે.<br>
        4.2 દર્દીને સારવાર દરમિયાન યોગ્ય વ્યાવસાયિક ધોરણો મુજબ સેવા આપવાનો પ્રયત્ન કરશે.<br>
        4.3 Hospital પોતાની મેડિકલ, ક્લિનિકલ, બિલિંગ અને વહીવટી કામગીરી માટે સંપૂર્ણપણે જવાબદાર રહેશે.<br>
        4.4 Hospital દર્દી સાથેના તમામ વ્યવહારોમાં લાગુ પડતા કાયદા અને પોતાના આંતરિક નિયમોનું પાલન કરશે.<br>
        4.5 Hospital HRM પાસેથી કોઈ Referral Fee, Commission અથવા Per Patient Payment ની અપેક્ષા રાખશે નહીં.<br>
        4.6 Hospital HRM ને કોઈ Referral Commission અથવા Per Patient Charge ચૂકવશે નહીં.<br>
        4.7 Hospital પોતાની નોંધણી, લાઇસન્સ અથવા અન્ય જરૂરી મંજૂરીઓ જાળવવાની જવાબદારી સ્વીકારશે.<br>
        4.8 Hospital HRM ને આપવામાં આવેલી માહિતીમાં કોઈ મહત્વપૂર્ણ ફેરફાર થાય તો વાજબી સમયમર્યાદામાં તેની જાણ કરશે.</p>

        <p><strong>5. BRANDING GUIDELINES</strong><br>
        5.1 HRM Hospital ને Program સંબંધિત Branding Material ઉપલબ્ધ કરાવી શકે છે.<br>
        5.2 Hospital માત્ર HRM દ્વારા મંજૂર કરાયેલ Branding Material નો જ ઉપયોગ કરશે.<br>
        5.3 HRM ની પૂર્વ લેખિત મંજૂરી વિના Logo, Artwork અથવા Promotional Content માં ફેરફાર કરવામાં આવશે નહીં.<br>
        5.4 Hospital પોતાના પરિસરમાં Branding એવી રીતે કરશે કે જેથી દર્દીઓને ભ્રમ ન થાય કે HRM મેડિકલ સેવા પ્રદાન કરે છે.<br>
        5.5 Hospital પોતાની બ્રાન્ડ ઓળખ અને HRM ની બ્રાન્ડ ઓળખને અલગ અને સ્પષ્ટ રાખશે.<br>
        5.6 ભાગીદારી સમાપ્ત થયા પછી Hospital વાજબી સમયમર્યાદામાં HRM સંબંધિત Branding દૂર કરશે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>6. MEMBERSHIP CARD TERMS</strong><br>
        6.1 PRIVY League Card એ HRM Consultancy દ્વારા સંચાલિત એક ખાનગી સભ્યપદ (Private Membership) કાર્યક્રમનો ભાગ છે.<br>
        6.2 સભ્યપદ ફી, કાર્ડની માન્યતા, પાત્રતા અને અન્ય સંબંધિત નિયમો HRM દ્વારા સમયાંતરે જાહેર કરવામાં આવશે અને HRM ની વેબસાઇટ પર ઉપલબ્ધ રહેશે.<br>
        6.3 Membership Card પર દર્શાવેલ સમયગાળા દરમિયાન જ તેનો ઉપયોગ કરી શકાશે.<br>
        6.4 Membership Card વ્યક્તિગત સભ્યપદ માટે જારી કરવામાં આવે છે. જો Family Membership ઉપલબ્ધ હોય, તો તેના નિયમો HRM દ્વારા અલગથી જાહેર કરવામાં આવશે.<br>
        6.5 Membership Card કોઈપણ પ્રકારનું Health Insurance, Mediclaim, Cashless Facility, Credit Instrument અથવા સારવારની ગેરંટી આપતું સાધન નથી.<br>
        6.6 Membership Card દ્વારા મળતા લાભો Hospital ની જાહેર કરેલી નીતિ, આ કરાર અને લાગુ પડતા નિયમોને આધીન રહેશે.<br>
        6.7 HRM વ્યવસાયિક, ટેક્નિકલ અથવા કાનૂની કારણોસર Membership Program માં વાજબી ફેરફાર કરી શકે છે. આવા મહત્વપૂર્ણ ફેરફારો અંગે Network Hospitals ને યોગ્ય રીતે જાણ કરવામાં આવશે.</p>

        <p><strong>7. MEMBER BENEFITS (RAHAT)</strong><br>
        7.1 Hospital પોતાની જાહેર કરેલી નીતિ મુજબ પાત્ર Card Holder ને ઉપલબ્ધ લાભ (રાહત) આપશે.<br>
        7.2 લાભ મેળવવા માટે Card Holder એ Admission અથવા Billing પહેલાં માન્ય Membership Card અથવા HRM દ્વારા સ્વીકારવામાં આવેલ અન્ય ઓળખ સાધન રજૂ કરવું પડશે, જ્યાં તે વ્યવહારિક રીતે શક્ય હોય.<br>
        7.3 Emergency પરિસ્થિતિમાં Hospital દર્દીની તાત્કાલિક સારવારને પ્રાથમિકતા આપશે. સભ્યપદની ચકાસણી બાદમાં Hospital ની પ્રક્રિયા મુજબ કરવામાં આવી શકે છે.<br>
        7.4 કેટલીક સેવાઓ, દવાઓ, ઇમ્પ્લાન્ટ્સ અથવા બહારથી ખરીદવામાં આવતી સામગ્રી પર રાહત ઉપલબ્ધ ન હોય શકે. આવી બાબતો Hospital ની જાહેર કરેલી નીતિ મુજબ નક્કી કરવામાં આવશે અને દર્દીને શક્ય હોય ત્યાં સુધી અગાઉથી જાણ કરવામાં આવશે.<br>
        7.5 Hospital કોઈપણ દર્દી સાથે સભ્યપદના આધારે સારવારની ગુણવત્તા, ઉપલબ્ધતા અથવા વ્યાવસાયિક નિર્ણયોમાં ભેદભાવ રાખશે નહીં.</p>

        <p><strong>8. BILLING AND PAYMENT</strong><br>
        8.1 Hospital પોતાનું બિલિંગ, હિસાબી પ્રક્રિયા અને ટેક્સ સંબંધિત કામગીરી પોતાની નીતિ અને લાગુ પડતા કાયદા મુજબ સંચાલિત કરશે.<br>
        8.2 જ્યાં Program હેઠળ રાહત આપવામાં આવે ત્યાં Hospital Final Invoice માં તે સ્પષ્ટ રીતે દર્શાવવાનો પ્રયત્ન કરશે.<br>
        8.3 Hospital દર્દીને આપવામાં આવેલ બિલ, રાહત, કર અને અન્ય નાણાકીય વિગતોની ચોકસાઈ માટે જવાબદાર રહેશે.<br>
        8.4 HRM Hospital ના બિલિંગ, ટેક્સ, હિસાબી નોંધો અથવા વીમા સંબંધિત દાવાઓનું સંચાલન કરતું નથી.<br>
        8.5 જો Hospital વીમા અથવા અન્ય તૃતીય પક્ષ સાથે વ્યવહાર કરે, તો તે સંબંધિત નિયમો અને પોતાની જવાબદારીઓનું પાલન કરશે.</p>

        <p><strong>9. PRIVACY AND DATA PROTECTION</strong><br>
        9.1 બંને પક્ષો લાગુ પડતા ગોપનીયતા અને ડેટા સુરક્ષા સંબંધિત કાયદાઓનું પાલન કરવાનો પ્રયત્ન કરશે.<br>
        9.2 HRM માત્ર Membership Program ના સંચાલન માટે જરૂરી અને કાયદેસર રીતે શેર કરી શકાય તેવી મર્યાદિત માહિતી જ પ્રાપ્ત કરશે.<br>
        9.3 Hospital દર્દીની ક્લિનિકલ, મેડિકલ અથવા સંવેદનશીલ વ્યક્તિગત માહિતીનું સંચાલન પોતાના કાયદાકીય અને વ્યાવસાયિક દાયિત્વ મુજબ કરશે.<br>
        9.4 કોઈપણ વ્યક્તિગત માહિતીનો ઉપયોગ તે માહિતી જે હેતુ માટે એકત્રિત કરવામાં આવી હોય તે હેતુ માટે જ કરવામાં આવશે.<br>
        9.5 બંને પક્ષો પોતાના નિયંત્રણ હેઠળ રહેલા ડેટાને સુરક્ષિત રાખવા માટે વાજબી વહીવટી અને ટેક્નિકલ પગલાં લેવાનો પ્રયત્ન કરશે.</p>

        <p><strong>10. INTELLECTUAL PROPERTY</strong><br>
        10.1 "HRM Consultancy", "PRIVY League Card", સંબંધિત Logo, Design, Website Content અને Branding Materials પરના બૌદ્ધિક સંપત્તિ અધિકારો, જ્યાં લાગુ પડે ત્યાં, HRM અથવા સંબંધિત અધિકારધારક પાસે રહેશે.<br>
        10.2 Hospital ને આ સામગ્રીનો ઉપયોગ માત્ર આ કરારના હેતુ માટે મર્યાદિત, બિન-વિશિષ્ટ (Non-Exclusive) અને રદ કરી શકાય તેવા (Revocable) અધિકાર હેઠળ કરવાની મંજૂરી આપવામાં આવે છે.<br>
        10.3 HRM ની પૂર્વ લેખિત મંજૂરી વિના Hospital કોઈપણ Logo, Design અથવા Branding Material માં ફેરફાર કરશે નહીં.<br>
        10.4 કરાર સમાપ્ત થયા પછી Hospital HRM સંબંધિત Branding Material નો ઉપયોગ બંધ કરશે અને વાજબી સમયમર્યાદામાં તેને દૂર કરશે.<br>
        10.5 આ કરાર Hospital ને HRM ની બૌદ્ધિક સંપત્તિ પર કોઈ માલિકી હક્ક આપતો નથી.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>11. COMPLIANCE WITH APPLICABLE LAWS</strong><br>
        11.1 બંને પક્ષો પોતાના પર લાગુ પડતા કાયદા, નિયમો, સરકારી સૂચનાઓ અને સંબંધિત વ્યાવસાયિક ધોરણોનું પાલન કરવાનો પ્રયત્ન કરશે.<br>
        11.2 આ કરારનો હેતુ દર્દીઓને માહિતી અને સભ્યપદ આધારિત લાભ ઉપલબ્ધ કરાવવાનો છે. આ કરારને કોઈપણ પ્રકારની ગેરકાયદેસર પ્રવૃત્તિ, ગેરવાજબી કમિશન વ્યવસ્થા અથવા દર્દીની પસંદગી પર અયોગ્ય અસર પાડે તેવી વ્યવસ્થા તરીકે અર્થઘટિત કરવામાં આવશે નહીં.<br>
        11.3 જો ભવિષ્યમાં કોઈ નવી કાનૂની અથવા નિયમનકારી આવશ્યકતા લાગુ પડે, તો બંને પક્ષો તે મુજબ જરૂરી ફેરફારો કરવા અંગે સહકાર આપશે.<br>
        11.4 દરેક પક્ષ પોતાના કર, લાઇસન્સ, નોંધણી, કર્મચારી, વ્યવસાય અને કાયદાકીય જવાબદારીઓ માટે સ્વતંત્ર રીતે જવાબદાર રહેશે.</p>

        <p><strong>12. REPRESENTATIONS AND DISCLAIMERS</strong><br>
        12.1 HRM Membership Program નું સંચાલન કરે છે અને મેડિકલ સેવા, નિદાન અથવા સારવાર પ્રદાન કરતું નથી.<br>
        12.2 Hospital પોતાની આરોગ્યસેવા, ક્લિનિકલ નિર્ણય, સારવારની ગુણવત્તા, દર્દીની સલામતી અને બિલિંગ માટે સંપૂર્ણપણે જવાબદાર રહેશે.<br>
        12.3 HRM કોઈ ચોક્કસ હોસ્પિટલ, ડૉક્ટર અથવા સારવારની ભલામણ અથવા ગેરંટી આપતું નથી.<br>
        12.4 Hospital દ્વારા આપવામાં આવતો લાભ (રાહત) Hospital ની જાહેર કરેલી નીતિ અને આ કરારની શરતોને આધીન રહેશે.<br>
        12.5 HRM કોઈપણ Hospital ને ચોક્કસ સંખ્યામાં સભ્યો, પૂછપરછ અથવા દર્દીઓ મળશે તેની ખાતરી આપતું નથી.<br>
        12.6 Membership Program નો ઉપયોગ કરવો કે ન કરવો તે દર્દીનો સ્વતંત્ર નિર્ણય રહેશે.</p>

        <p><strong>13. CONFIDENTIALITY</strong><br>
        13.1 બંને પક્ષો આ ભાગીદારી દરમિયાન પ્રાપ્ત થયેલી ગોપનીય વ્યવસાયિક, ટેક્નિકલ અથવા વહીવટી માહિતીની ગોપનીયતા જાળવશે.<br>
        13.2 કાયદા દ્વારા જરૂરી હોય અથવા બીજી પક્ષની લેખિત સંમતિ હોય તે સિવાય આવી માહિતી તૃતીય પક્ષને જાહેર કરવામાં આવશે નહીં.<br>
        13.3 આ કલમ કરાર સમાપ્ત થયા પછી પણ યોગ્ય સમયગાળા સુધી અમલમાં રહેશે.</p>

        <p><strong>14. INDEMNITY</strong><br>
        14.1 જો કોઈ તૃતીય પક્ષનો દાવો કોઈ પક્ષની પોતાની બેદરકારી, ખોટી રજૂઆત અથવા આ કરારના ભંગને કારણે ઉભો થાય, તો સંબંધિત પક્ષ લાગુ પડતા કાયદા મુજબ તેની જવાબદારી વહન કરશે.<br>
        14.2 દરેક પક્ષ પોતાની સેવાઓ, કર્મચારીઓ અને વ્યવસાયિક કામગીરી સંબંધિત દાવાઓ માટે મુખ્યત્વે પોતે જવાબદાર રહેશે.</p>

        <p><strong>15. LIMITATION OF LIABILITY</strong><br>
        15.1 કાયદા દ્વારા મંજૂર મર્યાદા સુધી, કોઈપણ પક્ષ બીજા પક્ષને પરોક્ષ, આકસ્મિક, વિશેષ અથવા પરિણામી નુકસાન માટે જવાબદાર રહેશે નહીં.<br>
        15.2 કોઈપણ પક્ષની જવાબદારી તે પક્ષના પોતાના કરારભંગ, બેદરકારી અથવા લાગુ પડતા કાયદા હેઠળની જવાબદારીઓને અસર કરતી નથી.<br>
        15.3 આ કરારની કોઈ જોગવાઈ લાગુ પડતા કાયદા હેઠળ જે જવાબદારી મર્યાદિત કરી શકાતી ન હોય તેને મર્યાદિત કરતી નથી.</p>

        <p><strong>16. TERM, SUSPENSION AND TERMINATION</strong><br>
        16.1 આ કરાર HRM દ્વારા Hospital ને Approved Partner તરીકે સ્વીકાર્યાની તારીખથી અમલમાં આવશે.<br>
        16.2 કરારનો પ્રારંભિક સમયગાળો એક (1) વર્ષનો રહેશે, જો બંને પક્ષો અન્યથા લેખિતમાં સંમત ન થાય.<br>
        16.3 કોઈપણ પક્ષ ઓછામાં ઓછી 30 દિવસની લેખિત નોટિસ આપી કરાર સમાપ્ત કરી શકે છે.<br>
        16.4 જો કોઈ પક્ષ આ કરારનો ગંભીર ભંગ કરે અને યોગ્ય સમયમર્યાદામાં તે સુધારે નહીં, તો બીજો પક્ષ કરાર સસ્પેન્ડ અથવા સમાપ્ત કરી શકે છે.<br>
        16.5 કરાર સમાપ્ત થયા પછી:<br>
        • Hospital HRM નું Branding Material વાપરવાનું બંધ કરશે.<br>
        • HRM Hospital ને Network Hospital Listમાંથી દૂર કરી શકે છે.<br>
        • બંને પક્ષો પોતાની ગોપનીય માહિતી અને બૌદ્ધિક સંપત્તિ સંબંધિત જવાબદારીઓનું પાલન ચાલુ રાખશે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>17. FORCE MAJEURE</strong><br>
        17.1 જો કુદરતી આફત, મહામારી, આગ, પૂર, ભૂકંપ, યુદ્ધ, આતંકવાદી ઘટના, સરકારી પ્રતિબંધ, વીજળી અથવા ટેલિકોમ સેવાઓમાં મોટા વિક્ષેપ, સાયબર હુમલા અથવા કોઈપણ પક્ષના વાજબી નિયંત્રણ બહારની પરિસ્થિતિને કારણે આ કરારનું પાલન કરવામાં વિલંબ થાય અથવા તે અસ્થાયી રીતે અશક્ય બને, તો તે સમયગાળા દરમિયાન સંબંધિત પક્ષને તે વિલંબ માટે જવાબદાર ગણવામાં આવશે નહીં.<br>
        17.2 અસરગ્રસ્ત પક્ષ શક્ય હોય ત્યાં સુધી બીજી પક્ષને પરિસ્થિતિ અંગે જાણ કરશે અને પરિસ્થિતિ સામાન્ય થયા બાદ કરારનું પાલન ફરી શરૂ કરવા માટે વાજબી પ્રયત્ન કરશે.</p>

        <p><strong>18. DISPUTE RESOLUTION AND GOVERNING LAW</strong><br>
        18.1 બંને પક્ષો કોઈપણ વિવાદને સૌપ્રથમ પરસ્પર ચર્ચા અને સદ્ભાવનાપૂર્વક ઉકેલવાનો પ્રયત્ન કરશે.<br>
        18.2 જો ચર્ચા દ્વારા યોગ્ય સમયગાળામાં ઉકેલ ન આવે, તો બંને પક્ષો લાગુ પડતા કાયદા મુજબ વિવાદ નિવારણની પ્રક્રિયા અપનાવી શકે છે.<br>
        18.3 આ કરાર ભારતના લાગુ પડતા કાયદાઓ અનુસાર અર્થઘટિત અને સંચાલિત કરવામાં આવશે.<br>
        18.4 લાગુ પડતા કાયદા હેઠળ જે અદાલત અથવા સત્તાધિકારીને અધિકારક્ષેત્ર હોય, તે વિવાદ સંબંધિત કાર્યવાહી માટે સક્ષમ રહેશે.</p>

        <p><strong>19. DIGITAL ACCEPTANCE</strong><br>
        19.1 Hospital દ્વારા ઓનલાઈન અરજી સબમિટ કરવી અને "Accept & Become Network Partner" બટન પર ક્લિક કરવું એ આ કરારની ઇલેક્ટ્રોનિક સ્વીકૃતિ તરીકે સિસ્ટમમાં નોંધવામાં આવશે.<br>
        19.2 આ કરાર Hospital દ્વારા ઓનલાઈન સ્વીકૃતિ અને ત્યારબાદ HRM દ્વારા અરજી મંજૂર કરવામાં આવે ત્યારથી અમલમાં આવશે.<br>
        19.3 સિસ્ટમ નીચેની વિગતો સુરક્ષિત રીતે સંગ્રહિત કરી શકે છે:<br>
        • Agreement Version<br>
        • Date & Time<br>
        • IP Address<br>
        • Browser / Device Information<br>
        • Hospital Registration ID<br>
        • Authorized User Details (જો ઉપલબ્ધ હોય)<br>
        19.4 આ માહિતી રેકોર્ડ જાળવવા, સુરક્ષા, ઓડિટ અને વિવાદ નિવારણ સંબંધિત વહીવટી હેતુઓ માટે ઉપયોગમાં લેવામાં આવી શકે છે.</p>

        <p><strong>20. MISCELLANEOUS</strong><br>
        20.1 Entire Agreement<br>
        આ દસ્તાવેજ બંને પક્ષો વચ્ચેનો સંપૂર્ણ કરાર છે અને અગાઉની તમામ મૌખિક અથવા લેખિત સમજણને બદલે છે.<br>
        20.2 Amendment<br>
        આ કરારમાં કોઈપણ ફેરફાર અથવા સુધારો બંને પક્ષોની લેખિત અથવા ડિજિટલ સંમતિ બાદ જ અમલમાં આવશે.<br>
        20.3 Severability<br>
        જો આ કરારની કોઈ જોગવાઈ અમાન્ય અથવા અમલમાં ન મૂકી શકાય તેવી ઠરે, તો બાકીની જોગવાઈઓ શક્ય હોય ત્યાં સુધી યથાવત અમલમાં રહેશે.<br>
        20.4 Assignment<br>
        Hospital HRM ની પૂર્વ લેખિત સંમતિ વિના આ કરાર હેઠળના પોતાના અધિકારો અથવા જવાબદારીઓ અન્ય કોઈને સોંપી શકશે નહીં.<br>
        20.5 Notices<br>
        આ કરાર સંબંધિત સત્તાવાર નોટિસ બંને પક્ષો દ્વારા નોંધાયેલા ઇમેઇલ સરનામા અથવા અન્ય લેખિત રીતે સ્વીકારેલ માધ્યમ દ્વારા મોકલી શકાશે.<br>
        20.6 Survival<br>
        Confidentiality, Intellectual Property, Indemnity, Limitation of Liability અને અન્ય એવી કલમો કે જે તેમના સ્વભાવથી કરાર સમાપ્ત થયા પછી પણ લાગુ રહેવી જોઈએ, તે કરાર સમાપ્ત થયા પછી પણ ચાલુ રહેશે.</p>

        <p><strong>21. HOSPITAL DECLARATION</strong><br>
        હું/અમે જાહેર કરીએ છીએ કે:<br>
        21.1 હું/અમે Hospital ના અધિકૃત પ્રતિનિધિ છીએ.<br>
        21.2 આ અરજીમાં આપવામાં આવેલી માહિતી અમારી જાણ મુજબ સાચી, સંપૂર્ણ અને અદ્યતન છે.<br>
        21.3 અમે આ કરારની તમામ શરતો વાંચી, સમજી અને સ્વીકારી છે.<br>
        21.4 અમે લાગુ પડતા કાયદા અને અમારા વ્યવસાયિક ધોરણો અનુસાર કામગીરી કરવાનો પ્રયત્ન કરીશું.<br>
        21.5 અમે HRM ના Logo, Name અને Branding Materials નો ઉપયોગ માત્ર આ કરાર મુજબ જ કરીશું.<br>
        21.6 Hospital દ્વારા આપવામાં આવતી આરોગ્યસેવા, ક્લિનિકલ નિર્ણય, બિલિંગ અને દર્દી સંબંધિત જવાબદારીઓ Hospital ની પોતાની રહેશે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>22. WEBSITE CONSENT</strong><br>
        ☐ હું/અમે હોસ્પિટલના અધિકૃત પ્રતિનિધિ તરીકે જાહેર કરીએ છીએ કે મેં/અમે HRM Consultancy – PRIVY League Card Network Hospital Partnership Agreement, Terms & Conditions, Privacy Policy અને Disclaimer વાંચ્યા, સમજ્યા અને સ્વીકાર્યા છે. હું/અમે આ કરાર સ્વીકારવાની સત્તા ધરાવું છું અને અરજીમાં આપવામાં આવેલી માહિતી સાચી હોવાનું જાહેર કરીએ છીએ.</p>

        <p><strong>23. FOOTER DISCLAIMER</strong><br>
        PRIVY League Card એ HRM Consultancy દ્વારા સંચાલિત ખાનગી સભ્યપદ કાર્યક્રમ છે. Hospital પોતાની સેવાઓ, સારવાર, બિલિંગ અને ક્લિનિકલ નિર્ણયો માટે સ્વતંત્ર રીતે જવાબદાર છે. HRM આરોગ્યસેવા પ્રદાતા નથી અને મેડિકલ સલાહ અથવા સારવાર આપતું નથી. સભ્યપદ, લાભો અને સંબંધિત શરતો સમયાંતરે સુધારવામાં આવી શકે છે. કૃપા કરીને નવીનતમ Terms & Conditions, Privacy Policy અને અન્ય નીતિઓ માટે HRM ની અધિકૃત વેબસાઇટ જુઓ.</p>

        <p><strong>24. ELIGIBILITY OF HOSPITAL</strong><br>
        24.1 Hospital જાહેર કરે છે કે તેની પાસે પોતાની સેવાઓ ચલાવવા માટે લાગુ પડતા કાયદા મુજબ જરૂરી નોંધણીઓ, લાઇસન્સ અને મંજૂરીઓ છે અથવા જ્યાં જરૂરી હોય ત્યાં તે જાળવવાની જવાબદારી તેની રહેશે.<br>
        24.2 Hospital દ્વારા આપવામાં આવેલી માહિતીમાં કોઈ મહત્વપૂર્ણ ફેરફાર થાય તો તે યોગ્ય સમયમર્યાદામાં HRM ને જાણ કરશે.</p>

        <p><strong>25. CARD VERIFICATION</strong><br>
        25.1 Hospital સભ્યપદની ચકાસણી HRM દ્વારા ઉપલબ્ધ કરાવવામાં આવેલી પ્રક્રિયા અથવા સિસ્ટમ મુજબ કરી શકે છે.<br>
        25.2 જો Membership Card અમાન્ય, સમાપ્ત થયેલું અથવા શંકાસ્પદ જણાય, તો Hospital ચકાસણી પૂર્ણ થાય ત્યાં સુધી Program હેઠળનો લાભ રોકી શકે છે.</p>

        <p><strong>26. FRAUD PREVENTION</strong><br>
        26.1 બંને પક્ષો છેતરપિંડી, ખોટા દસ્તાવેજો અથવા Program ના દુરુપયોગને રોકવા માટે વાજબી સહકાર આપશે.<br>
        26.2 આવી કોઈ ઘટના અંગે માહિતી મળે તો સંબંધિત પક્ષ બીજી પક્ષને યોગ્ય સમયમર્યાદામાં જાણ કરશે.</p>

        <p><strong>27. AUDIT AND RECORDS</strong><br>
        27.1 બંને પક્ષો આ Program સંબંધિત જરૂરી વ્યવસાયિક રેકોર્ડ વાજબી સમયગાળા સુધી જાળવવાનો પ્રયત્ન કરશે.<br>
        27.2 HRM પોતાની સિસ્ટમમાં Agreement Version, Acceptance Date, IP Address, Device Information અને Audit Log જાળવી શકે છે.</p>

        <p><strong>28. COMMUNICATION</strong><br>
        28.1 Program સંબંધિત સૂચનાઓ, અપડેટ્સ અને ઓપરેશનલ માહિતી ઇમેઇલ, Dashboard અથવા અન્ય અધિકૃત ડિજિટલ માધ્યમ દ્વારા આપવામાં આવી શકે છે.<br>
        28.2 Hospital પોતાનું નોંધાયેલ ઇમેઇલ અને સંપર્ક વિગતો અદ્યતન રાખવા માટે જવાબદાર રહેશે.</p>

        <p><strong>29. BRAND PROTECTION</strong><br>
        29.1 Hospital HRM ના Logo, Name અથવા Branding નો એવો ઉપયોગ કરશે નહીં જે ભ્રામક, અપમાનજનક અથવા HRM ની પ્રતિષ્ઠાને નુકસાન પહોંચાડે.<br>
        29.2 HRM ને વાજબી કારણોસર કોઈ Branding Material પાછું ખેંચવાનો અથવા બદલવાનો અધિકાર રહેશે, અને Hospital તે અંગે સહકાર આપશે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>30. NO GUARANTEE</strong><br>
        30.1 HRM કોઈ ચોક્કસ સંખ્યામાં સભ્યો, પૂછપરછ, દર્દીઓ, આવક અથવા વ્યવસાયિક લાભની ખાતરી આપતું નથી.<br>
        30.2 Hospital પણ કોઈપણ સભ્યને ચોક્કસ સારવાર, દાખલાતી અથવા અન્ય સેવા મળશે તેની ખાતરી આપતું નથી; તે Hospital ની નીતિ, ઉપલબ્ધતા અને લાગુ પડતા કાયદા પર આધારિત રહેશે.</p>

        <p><strong>31. INDEPENDENT DECISION OF PATIENT</strong><br>
        31.1 દર્દીને પોતાની પસંદગીની હોસ્પિટલ અથવા આરોગ્યસેવા પ્રદાતા પસંદ કરવાનો સંપૂર્ણ અધિકાર રહેશે.<br>
        31.2 આ Program નો હેતુ માત્ર સભ્યપદ સંબંધિત માહિતી અને જાહેર કરાયેલા લાભો ઉપલબ્ધ કરાવવાનો છે; તે દર્દીની પસંદગી પર બળજબરી કરતો નથી.</p>

        <p><strong>32. VERSION CONTROL</strong><br>
        32.1 આ Agreement નો Version Number, Effective Date અને Revision History HRM દ્વારા જાળવવામાં આવશે.<br>
        32.2 નવી આવૃત્તિ ભવિષ્યની ભાગીદારીઓ અથવા HRM દ્વારા નક્કી કરાયેલ પ્રક્રિયા મુજબ લાગુ થઈ શકે છે.</p>

        <p><strong>33. DIGITAL CARD ACTIVATION & VERIFICATION</strong><br>
        33.1 દરેક PRIVY League Card ને એક Unique Membership ID આપવામાં આવશે.<br>
        33.2 Card HRM System માં "Inactive" રહેશે જ્યાં સુધી HRM દ્વારા સભ્યપદ સક્રિય ન કરવામાં આવે.<br>
        33.3 Card Active થયા પછી System નીચેની વિગતો સંગ્રહિત કરશે:<br>
        • Membership Number<br>
        • Member Name<br>
        • Photograph<br>
        • Mobile Number<br>
        • Email ID (જો ઉપલબ્ધ હોય)<br>
        • Activation Date & Time<br>
        • Membership Validity<br>
        • Activation Status<br>
        • Activated By (HRM User/Admin)<br>
        • Membership Category<br>
        33.4 દરેક Card ની Activation History System માં Audit હેતુ માટે જાળવવામાં આવશે.</p>

        <p><strong>34. HOSPITAL BILL VERIFICATION PROCESS</strong><br>
        34.1 Card Holder રાહત મેળવવા માટે Hospital માં Billing પહેલાં અથવા Hospital ની પ્રક્રિયા મુજબ Membership Card રજૂ કરશે.<br>
        34.2 Hospital System માં Membership Number દાખલ કરીને Card Verify કરશે.<br>
        34.3 દરેક ઉપયોગ માટે Member ના નોંધાયેલા મોબાઇલ નંબર પર One-Time Password (OTP) મોકલવામાં આવી શકે છે.<br>
        34.4 યોગ્ય OTP ચકાસણી પૂર્ણ થયા પછી જ Program હેઠળનો લાભ લાગુ કરવામાં આવશે.<br>
        34.5 જો OTP Verification પૂર્ણ ન થાય, તો Hospital પોતાની નીતિ મુજબ Program હેઠળનો લાભ ન આપવા અંગે નિર્ણય લઈ શકે છે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>35. DIGITAL BILL SUBMISSION</strong><br>
        35.1 જ્યાં Program હેઠળ લાભ આપવામાં આવે, ત્યાં Hospital HRM Portal પર સંબંધિત ટ્રાન્ઝેક્શનની વિગતો અપલોડ કરશે.<br>
        35.2 Hospital નીચેની માહિતી દાખલ કરી શકે છે:<br>
        • Membership Number<br>
        • Member Name<br>
        • Hospital Name<br>
        • Bill Number<br>
        • Bill Date<br>
        • Gross Bill Amount<br>
        • Rahat Amount<br>
        • Net Bill Amount<br>
        • OTP Verification Status<br>
        • Billing Executive Name અથવા User ID<br>
        • Supporting Invoice Copy (જ્યાં જરૂરી હોય)<br>
        35.3 Hospital ખાતરી કરશે કે અપલોડ કરેલી માહિતી તેની જાણ મુજબ સાચી અને પૂર્ણ છે.</p>

        <p><strong>36. TRANSACTION HISTORY</strong><br>
        36.1 HRM પોતાના Membership Program ના સંચાલન માટે Transaction History જાળવી શકે છે.<br>
        36.2 ઉપલબ્ધ માહિતીમાં નીચેની વિગતોનો સમાવેશ થઈ શકે છે:<br>
        • કેટલા વખત Card નો ઉપયોગ થયો<br>
        • કઈ Hospital માં ઉપયોગ થયો<br>
        • ઉપયોગની તારીખ અને સમય<br>
        • Bill Amount<br>
        • Rahat Amount<br>
        • Membership Status<br>
        • Verification Status<br>
        36.3 આ માહિતી Program Management, Customer Support, Audit અને Fraud Prevention જેવા વાજબી હેતુઓ માટે ઉપયોગમાં લેવામાં આવી શકે છે.</p>

        <p><strong>37. MEMBER DASHBOARD</strong><br>
        37.1 Member પોતાના Dashboard માં ઉપલબ્ધ હોય તો નીચેની વિગતો જોઈ શકશે:<br>
        • Membership Status<br>
        • Activation Date<br>
        • Validity<br>
        • ઉપયોગનો ઇતિહાસ<br>
        • કુલ Bill Amount<br>
        • કુલ Rahat પ્રાપ્ત<br>
        • Network Hospital History<br>
        37.2 HRM સમયાંતરે Dashboard ના Features માં ફેરફાર કરી શકે છે.</p>

        <p><strong>38. HOSPITAL USER ACCOUNTABILITY</strong><br>
        38.1 દરેક Hospital User ને અલગ Login ID આપવામાં આવશે.<br>
        38.2 System દરેક Transaction માટે નીચેની વિગતો Log કરી શકે છે:<br>
        • Hospital User ID<br>
        • User Name<br>
        • Login Time<br>
        • IP Address<br>
        • Device Information<br>
        • OTP Verification Time<br>
        • Bill Upload Time<br>
        38.3 Hospital પોતાના User Accounts ની સુરક્ષા અને યોગ્ય ઉપયોગ માટે જવાબદાર રહેશે.</p>

        <div class="html2pdf__page-break"></div>

        <p><strong>39. AUDIT LOGS</strong><br>
        39.1 HRM નીચેની Audit માહિતી જાળવી શકે છે:<br>
        • Card Activation History<br>
        • OTP Verification Logs<br>
        • Bill Upload Logs<br>
        • Hospital User Activity<br>
        • Member Activity<br>
        • Login History<br>
        • Change History<br>
        • Approval History<br>
        39.2 Audit Logs નો ઉપયોગ માત્ર સુરક્ષા, સિસ્ટમ સંચાલન, વિવાદ નિવારણ, અનુપાલન (Compliance) અને છેતરપિંડી નિવારણ જેવા વાજબી હેતુઓ માટે કરવામાં આવશે.</p>

        <p><strong>40. MEMBERSHIP FEE</strong><br>
        40.1 PRIVY League Card માટેની Membership Fee હાલમાં ₹500 (લાગુ પડતા કર સિવાય અથવા સહિત, જેમ HRM દ્વારા જાહેર કરવામાં આવે) રહેશે.<br>
        40.2 Membership Fee સીધી HRM Consultancy ને ઓનલાઈન પેમેન્ટ ગેટવે અથવા HRM દ્વારા અધિકૃત ડિજિટલ પેમેન્ટ માધ્યમ દ્વારા જ ચૂકવવાની રહેશે.<br>
        40.3 Hospital ને Membership Fee વસૂલવાનો, એકત્રિત કરવાનો અથવા તેના બદલામાં રસીદ આપવાનો અધિકાર રહેશે નહીં, સિવાય કે HRM દ્વારા લેખિતમાં અલગથી અધિકૃત કરવામાં આવ્યું હોય.<br>
        40.4 Membership Fee HRM દ્વારા સંચાલિત Membership Program, ટેકનોલોજી પ્લેટફોર્મ, ગ્રાહક સહાય અને સંબંધિત વહીવટી સેવાઓ માટે લેવામાં આવે છે.<br>
        40.5 Membership Feeમાંથી Hospital ને કોઈ ભાગ, કમિશન અથવા આવક મળવાની નથી, જો બંને પક્ષો વચ્ચે અલગથી લેખિત કરાર ન થયો હોય.<br>
        40.6 Membership Fee ની ચુકવણીથી સભ્યને માત્ર Membership Program માં જોડાવાનો અધિકાર મળે છે. તે કોઈ મેડિકલ સારવાર, હોસ્પિટલ સેવા, વીમા કવર, કેશલેસ સુવિધા અથવા કોઈ નિશ્ચિત લાભની ગેરંટી આપતી નથી.<br>
        40.7 Membership Fee સંબંધિત Invoice અથવા Payment Receipt HRM દ્વારા સભ્યને ડિજિટલ સ્વરૂપે ઉપલબ્ધ કરાવવામાં આવશે.<br>
        40.8 Hospital Membership Fee સંબંધિત કોઈ વિવાદ, રિફંડ અથવા પેમેન્ટ ક્લેમ માટે જવાબદાર રહેશે નહીં. આવા તમામ પ્રશ્નો HRM દ્વારા સંભાળવામાં આવશે.</p>

        <p><strong>Website Disclaimer</strong><br>
        PRIVY League Card એ HRM Consultancy દ્વારા સંચાલિત Private Membership Program છે. Membership Fee ₹500 (લાગુ કર મુજબ) સીધી HRM Consultancy ને ઓનલાઈન ચૂકવવાની રહેશે. Hospital કોઈ Membership Fee વસૂલતું નથી અને તે માટે જવાબદાર નથી. Membership Fee મેડિકલ સારવાર અથવા ઈન્સ્યોરન્સ પ્રીમિયમ નથી.</p>

        <p><strong>CARD DISCLAIMER</strong><br>
        • PRIVY League Card is a Private Membership Program by HRM Consultancy.<br>
        • Membership Fee: ₹500, payable only to HRM Consultancy.<br>
        • This Card is not an Insurance, Mediclaim, or Cashless Card.<br>
        • Benefits are available only at participating Network Hospitals, subject to applicable Terms & Conditions.<br>
        • Hospital is solely responsible for medical treatment, billing, and patient care.<br>
        • Card validity and OTP verification (where applicable) are mandatory.</p>

        <p><strong>Support & Contact</strong><br>
        HRM Consultancy<br>
        Director: Mr. Nirav Pandya<br>
        📧 director@myhrm.co.in<br>
        📞 +91 98794 50072<br>
        🌐 www.myhrm.co.in</p>

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
            <strong>HRM CONSULTANCY વતી<br>(For HRM CONSULTANCY)</strong><br><br>
            અધિકૃત હસ્તાક્ષરકર્તા<br><br>
            નામ: શ્રી નીરવ પંડ્યા<br><br>
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
  const hasPermission = (key) => adminUsername === 'admin' || permissions.includes(key);

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
          {hasPermission('scanner') && (
            <Link to="/admin/dashboard?tab=patient-bills" className={`admin-nav-item ${activeTab === 'patient-bills' ? 'active' : ''}`} onClick={() => setActiveTab('patient-bills')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Member Bills
            </Link>
          )}
          {hasPermission('activation') && (
            <Link to="/admin/dashboard?tab=activation" className={`admin-nav-item ${activeTab === 'activation' ? 'active' : ''}`} onClick={() => setActiveTab('activation')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Card Activation & Renewals
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
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'accounts' ? 'Admin Access' : activeTab === 'scanner' ? 'Card Scanner' : activeTab === 'scan-logs' ? 'Scan Logs' : activeTab === 'activation' ? 'Card Activation & Renewals' : activeTab === 'patient-bills' ? 'Member Bills' : 'QR Registration Stats'}</h1>
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
                          <span>{key === 'dashboard' ? 'Dashboard / Overview' : key === 'qrStats' ? 'QR Registration Stats' : key === 'adminAccess' ? 'Admin Access Manager' : key === 'scanner' ? 'Card Scanner (Hospital)' : key === 'activation' ? 'Card Activation & Renewals' : key === 'scanLogs' ? 'Scan Logs' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
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
                        <img src="/images/card-logo.png" alt="HRM" className="admin-id-mini-logo" />
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
                    History of member cards scanned by hospitals.
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
                        <th>Member Name</th>
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
                    {privilegeCards.filter(c => c.card_status === 'PENDING_ACTIVATION' || c.card_status === 'PENDING').length}
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
                        <th>Email</th>
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
                            (card.mobile && card.mobile.includes(s)) ||
                            (card.email && card.email.toLowerCase().includes(s)) ||
                            (card.card_name && card.card_name.toLowerCase().includes(s))
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
                              {card.card_name && (
                                <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>
                                  Header: {card.card_name}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '2px' }}>{card.mobile || 'No Mobile'}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '12px', color: 'var(--ad-text-2)' }}>{card.email || <span style={{ color: 'var(--ad-text-3)', fontStyle: 'italic' }}>No email</span>}</div>
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
                              {(card.card_status === 'PENDING_ACTIVATION' || card.card_status === 'PENDING') && (
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
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {card.card_status !== 'ACTIVE' ? (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '6px 12px', fontSize: '12px', background: '#2ecc71', borderColor: '#2ecc71', borderRadius: '6px' }}
                                  >
                                    Approve / Activate
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleActivateCard(card.id_no)} 
                                    className="admin-submit-btn" 
                                    style={{ padding: '6px 12px', fontSize: '12px', background: '#3498db', borderColor: '#3498db', borderRadius: '6px' }}
                                  >
                                    Renew (1 Yr)
                                  </button>
                                )}
                                
                                {card.card_status === 'ACTIVE' && (
                                  <button 
                                    onClick={() => handleDeactivateCard(card.id_no)} 
                                    title="Deactivate User"
                                    style={{ 
                                      background: '#fff', color: '#f57c00', border: '1px solid #ffcc80',
                                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '16px'
                                    }}
                                  >
                                    🚫
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDeleteCard(card.id_no)} 
                                  title="Delete User Permanently"
                                  style={{ 
                                    background: '#fff', color: '#c62828', border: '1px solid #ef9a9a',
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '16px'
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {privilegeCards.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-3)' }}>
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

          {/* 6. MEMBER BILLS TAB */}
          {activeTab === 'patient-bills' && hasPermission('scanner') && (
            <div className="activation-tab-layout">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="admin-form-title" style={{ margin: 0 }}>Member Bills</h2>
                  <p style={{ fontSize: '13px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>
                    {adminUsername !== 'admin'
                      ? 'Submit member bill details for HRM card holders.'
                      : 'Double-click a hospital name to reveal its bill details.'}
                  </p>
                </div>
                <button onClick={fetchPatientBills} className="admin-submit-btn" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                  Refresh
                </button>
              </div>

              {/* ── Hospital or Super Admin submits a new bill ── */}
              <div className="admin-form-card" style={{ marginBottom: '24px' }}>
                  <h3 className="admin-form-title" style={{ fontSize: '15px', marginBottom: '20px' }}>Submit Member Bill</h3>
                  {billSubmitSuccess && (
                    <div style={{ background: 'rgba(46,204,113,0.12)', border: '1px solid #2ecc71', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#2ecc71', fontWeight: '600', fontSize: '13px' }}>
                      ✅ Bill submitted successfully!
                    </div>
                  )}
                  <form onSubmit={handleBillSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="admin-input-group">
                      <label>Hospital Name *</label>
                      <input type="text" className="admin-text-input" required value={billForm.hospitalName}
                        onChange={e => setBillForm({...billForm, hospitalName: e.target.value})}
                        placeholder="e.g. Apollo Hospital" />
                    </div>
                    <div className="admin-input-group">
                      <label>Member Name *</label>
                      <input type="text" className="admin-text-input" required value={billForm.patientName}
                        onChange={e => setBillForm({...billForm, patientName: e.target.value})}
                        placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div className="admin-input-group">
                      <label>HRM Card ID *</label>
                      <input type="text" className="admin-text-input" required value={billForm.hrmId}
                        onChange={e => setBillForm({...billForm, hrmId: e.target.value})}
                        placeholder="e.g. HRM1A2B3C" />
                    </div>
                    <div className="admin-input-group">
                      <label>Bill Date *</label>
                      <input type="date" className="admin-text-input" required value={billForm.billDate}
                        onChange={e => setBillForm({...billForm, billDate: e.target.value})} />
                    </div>
                    <div className="admin-input-group">
                      <label>Bill Amount (₹) *</label>
                      <input type="number" min="0" step="0.01" className="admin-text-input" required value={billForm.billAmount}
                        onChange={e => {
                          const amt = e.target.value;
                          const discVal = String(billForm.discount || '');
                          let discAmount = 0;
                          if (discVal.includes('%')) {
                            discAmount = ((parseFloat(amt) || 0) * parseFloat(discVal)) / 100;
                          } else {
                            discAmount = parseFloat(discVal) || 0;
                          }
                          const after = (parseFloat(amt) || 0) - (discAmount || 0);
                          setBillForm({...billForm, billAmount: amt, afterDiscount: after > 0 ? after.toFixed(2) : '0.00'});
                        }}
                        placeholder="0.00" />
                    </div>
                    <div className="admin-input-group">
                      <label>Discount (₹ or %)</label>
                      <input type="text" className="admin-text-input" value={billForm.discount}
                        onChange={e => {
                          const discVal = e.target.value;
                          const amt = parseFloat(billForm.billAmount) || 0;
                          let discAmount = 0;
                          if (discVal.includes('%')) {
                            discAmount = (amt * parseFloat(discVal)) / 100;
                          } else {
                            discAmount = parseFloat(discVal) || 0;
                          }
                          const after = amt - (discAmount || 0);
                          setBillForm({...billForm, discount: discVal, afterDiscount: after > 0 ? after.toFixed(2) : '0.00'});
                        }}
                        placeholder="e.g. 100 or 10%" />
                    </div>
                    <div className="admin-input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Amount After Discount (₹)</label>
                      <input type="number" min="0" step="0.01" className="admin-text-input" readOnly value={billForm.afterDiscount}
                        style={{ background: 'rgba(46,204,113,0.07)', borderColor: '#2ecc71', color: '#2ecc71', fontWeight: '700', cursor: 'default' }}
                        placeholder="Auto-calculated" />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="admin-submit-btn" disabled={billsLoading} style={{ padding: '10px 28px' }}>
                        {billsLoading ? 'Submitting...' : 'Submit Bill'}
                      </button>
                    </div>
                  </form>
                </div>

              {/* ── Super Admin: hospital list + double-click to reveal ── */}
              {adminUsername === 'admin' && (
                <div style={{ display: 'grid', gridTemplateColumns: selectedHospitalBill ? '280px 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>

                  {/* Hospital Name List */}
                  <div className="admin-table-card">
                    <h3 className="admin-form-title" style={{ fontSize: '14px', marginBottom: '4px' }}>Hospital Entries</h3>

                    {billsLoading ? (
                      <p style={{ color: 'var(--ad-text-3)', fontSize: '13px' }}>Loading...</p>
                    ) : patientBills.length === 0 ? (
                      <p style={{ color: 'var(--ad-text-3)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No bills submitted yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '480px', overflowY: 'auto' }}>
                        {patientBills.map((bill, idx) => (
                          <div
                            key={bill.id}
                            onDoubleClick={() => setSelectedHospitalBill(bill)}
                            title="Double-click to reveal bill details"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                              border: selectedHospitalBill?.id === bill.id
                                ? '1px solid #e74c3c'
                                : '1px solid var(--ad-border)',
                              background: selectedHospitalBill?.id === bill.id
                                ? 'rgba(231,76,60,0.08)'
                                : 'var(--ad-card)',
                              transition: 'all 0.2s',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'rgba(231,76,60,0.15)', color: '#e74c3c',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '700', fontSize: '13px', flexShrink: 0
                            }}>
                              {(bill.hospital_name || 'H').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ad-text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {bill.hospital_name || 'Unknown'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--ad-text-3)' }}>
                                {bill.bill_date || new Date(bill.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            {selectedHospitalBill?.id === bill.id && (
                              <span style={{ fontSize: '10px', color: '#e74c3c', fontWeight: '600' }}>● OPEN</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bill Detail Panel — only shown when a hospital is double-clicked */}
                  {selectedHospitalBill && (
                    <div className="admin-form-card" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h3 className="admin-form-title" style={{ margin: 0, fontSize: '15px' }}>Bill Details</h3>
                          <p style={{ fontSize: '11px', color: 'var(--ad-text-3)', margin: '4px 0 0 0' }}>Submitted by {selectedHospitalBill.hospital_name}</p>
                        </div>
                        <button
                          onClick={() => setSelectedHospitalBill(null)}
                          style={{ background: 'var(--ad-card)', border: '1px solid var(--ad-border)', color: 'var(--ad-text-3)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Close"
                        >✕</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {[
                          { label: 'Hospital Name', value: selectedHospitalBill.hospital_name, icon: '🏥' },
                          { label: 'Member Name', value: selectedHospitalBill.patient_name, icon: '👤' },
                          { label: 'HRM Card ID', value: selectedHospitalBill.hrm_id, icon: '🪪', mono: true },
                          { label: 'Bill Date', value: selectedHospitalBill.bill_date, icon: '📅' },
                          { label: 'Bill Amount (₹)', value: selectedHospitalBill.bill_amount != null ? `₹ ${parseFloat(selectedHospitalBill.bill_amount).toFixed(2)}` : '—', icon: '💰', highlight: 'blue' },
                          { label: 'Discount (₹)', value: selectedHospitalBill.discount != null ? `₹ ${parseFloat(selectedHospitalBill.discount).toFixed(2)}` : '—', icon: '🏷️', highlight: 'amber' },
                        ].map(({ label, value, icon, mono, highlight }) => (
                          <div key={label} className="admin-input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ad-text-3)' }}>
                              {icon} {label}
                            </label>
                            <div style={{
                              padding: '10px 14px', borderRadius: '8px',
                              border: '1px solid var(--ad-border)',
                              background: highlight === 'blue' ? 'rgba(52,152,219,0.07)' : highlight === 'amber' ? 'rgba(243,156,18,0.07)' : 'var(--ad-input)',
                              color: highlight === 'blue' ? '#3498db' : highlight === 'amber' ? '#f39c12' : 'var(--ad-text-1)',
                              fontWeight: highlight ? '700' : '500',
                              fontSize: '13px',
                              fontFamily: mono ? 'monospace' : 'inherit',
                              letterSpacing: mono ? '0.05em' : 'normal'
                            }}>
                              {value || '—'}
                            </div>
                          </div>
                        ))}

                        {/* After Discount — full width, prominent */}
                        <div className="admin-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#2ecc71' }}>
                            ✅ Amount After Discount (₹)
                          </label>
                          <div style={{
                            padding: '14px 18px', borderRadius: '10px',
                            border: '2px solid #2ecc71',
                            background: 'rgba(46,204,113,0.08)',
                            color: '#2ecc71', fontWeight: '800', fontSize: '22px',
                            letterSpacing: '0.02em', textAlign: 'center'
                          }}>
                            {selectedHospitalBill.after_discount != null
                              ? `₹ ${parseFloat(selectedHospitalBill.after_discount).toFixed(2)}`
                              : selectedHospitalBill.bill_amount != null
                                ? `₹ ${(parseFloat(selectedHospitalBill.bill_amount) - (parseFloat(selectedHospitalBill.discount) || 0)).toFixed(2)}`
                                : '—'}
                          </div>
                        </div>

                        {/* Submitted timestamp */}
                        <div style={{ gridColumn: '1 / -1', textAlign: 'right', fontSize: '11px', color: 'var(--ad-text-3)', marginTop: '4px' }}>
                          Submitted on {new Date(selectedHospitalBill.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Hospital's own submitted bills (read-only view) ── */}
              {adminUsername !== 'admin' && patientBills.length > 0 && (
                <div className="admin-table-card" style={{ marginTop: '24px' }}>
                  <h3 className="admin-form-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Your Submitted Bills</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {patientBills.map(bill => (
                      <div key={bill.id} style={{ background: 'var(--ad-input)', borderRadius: '10px', padding: '14px 18px', border: '1px solid var(--ad-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-3)' }}>Member: <span style={{ color: 'var(--ad-text-1)', fontWeight: '600' }}>{bill.patient_name}</span></div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-3)' }}>HRM ID: <code style={{ color: '#3498db' }}>{bill.hrm_id}</code></div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-3)' }}>Bill Amt: <span style={{ color: '#3498db', fontWeight: '700' }}>₹{bill.bill_amount}</span></div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-3)' }}>Discount: <span style={{ color: '#f39c12', fontWeight: '700' }}>₹{bill.discount || 0}</span></div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-3)', gridColumn: '1 / -1' }}>Final: <span style={{ color: '#2ecc71', fontWeight: '800', fontSize: '14px' }}>₹{bill.after_discount || (bill.bill_amount - (bill.discount || 0))}</span> &nbsp;·&nbsp; Date: {bill.bill_date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
