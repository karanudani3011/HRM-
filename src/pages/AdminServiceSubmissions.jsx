import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import { Trash2, Eye, Download, Info, CheckCircle } from 'lucide-react';
import './AdminDashboard.css';
import './AdminServiceSubmissions.css';

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

const buildSupabasePayload = (item) => {
  if (item.formType === 'Doctor Registration') {
    return {
      full_name: item.fullName || item.name || 'Unnamed',
      mobile: item.mobile || '',
      email: item.email,
      dob: item.dob || null,
      gender: item.gender || null,
      current_city: item.currentCity || item.city || '',
      willing_to_relocate: item.willingToRelocate || 'No',
      highest_qualification: item.highestQualification || '',
      super_speciality: item.superSpeciality || '',
      year_of_passing: parseInt(item.yearOfPassing) || null,
      college: item.college || '',
      reg_no: item.regNo || '',
      reg_state: item.regState || '',
      total_experience: parseInt(item.totalExperience) || 0,
      auth_letter_url: item.authLetter || item.authLetterUrl || '',
      selfie_url: item.selfie || ''
    };
  } else if (item.formType === 'HR Registration') {
    return {
      full_name: item.fullName || item.name || 'Unnamed',
      company_name: item.companyName || '',
      designation: item.designation || '',
      mobile: item.mobile || '',
      email: item.email,
      hiring_needs: item.hiringNeeds || '',
      selfie_url: item.selfie || ''
    };
  } else if (item.formType === 'Partner Registration') {
    return {
      hospital_name: item.hospitalName || item.name || '',
      license_number: item.licenseNumber || '',
      total_beds: parseInt(item.totalBeds) || null,
      icu_beds: parseInt(item.icuBeds) || null,
      specialties: item.specialties || '',
      contact_person: item.contactPerson || '',
      email: item.email || '',
      phone: item.phone || ''
    };
  } else {
    return {
      hospital_name: item.hospitalName || '',
      hospital_type: item.hospitalType || '',
      reg_number: item.regNumber || '',
      year_of_establishment: parseInt(item.yearOfEstablishment) || null,
      bed_capacity: parseInt(item.bedCapacity) || null,
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
      website: item.website || '',
      admin_name: item.adminName || '',
      designation: item.designation || '',
      mobile: item.mobile || '',
      email: item.email,
      whatsapp: item.whatsapp || '',
      auth_letter_url: item.authLetter || item.authLetterUrl || '',
      selfie_url: item.selfie || '',
      logo_url: item.logo || '',
      needed_doctors: item.neededDoctors || [],
      job_types: item.jobTypes || [],
      exp_range: item.expRange || '',
      salary_range: item.salaryRange || '',
      urgency: item.urgency || '',
      facility_highlights: item.facilityHighlights || '',
      hospital_photos: item.hospitalPhotos || [],
      gst_number: item.gstNumber || '',
      plan: item.plan || 'Free'
    };
  }
};

const mapSupaToFirestore = (item, category) => {
  if (category === 'Doctor Registration') {
    return {
      formType: 'Doctor Registration',
      fullName: item.full_name,
      name: item.full_name,
      email: item.email,
      mobile: item.mobile,
      dob: item.dob,
      gender: item.gender,
      currentCity: item.current_city,
      city: item.current_city,
      willingToRelocate: item.willing_to_relocate,
      highestQualification: item.highest_qualification,
      superSpeciality: item.super_speciality,
      yearOfPassing: item.year_of_passing?.toString() || '',
      college: item.college,
      regNo: item.reg_no,
      regState: item.reg_state,
      totalExperience: item.total_experience?.toString() || '0',
      authLetterUrl: item.auth_letter_url || '',
      authLetter: item.auth_letter_url || '',
      selfie: item.selfie_url || '',
      createdAt: new Date(item.created_at)
    };
  } else if (category === 'HR Registration') {
    return {
      formType: 'HR Registration',
      fullName: item.full_name,
      name: item.full_name,
      companyName: item.company_name,
      designation: item.designation,
      mobile: item.mobile,
      email: item.email,
      hiringNeeds: item.hiring_needs,
      selfie: item.selfie_url || '',
      createdAt: new Date(item.created_at)
    };
  } else if (category === 'Partner Registration') {
    return {
      formType: 'Partner Registration',
      hospitalName: item.hospital_name,
      name: item.hospital_name,
      licenseNumber: item.license_number || '',
      totalBeds: item.total_beds?.toString() || '',
      icuBeds: item.icu_beds?.toString() || '',
      specialties: item.specialties || '',
      contactPerson: item.contact_person || '',
      email: item.email,
      phone: item.phone || '',
      createdAt: new Date(item.created_at)
    };
  } else {
    return {
      formType: 'Hospital Registration',
      hospitalName: item.hospital_name,
      hospitalType: item.hospital_type,
      regNumber: item.reg_number,
      yearOfEstablishment: item.year_of_establishment?.toString() || '',
      bedCapacity: item.bed_capacity?.toString() || '',
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      website: item.website,
      adminName: item.admin_name,
      designation: item.designation,
      mobile: item.mobile,
      email: item.email,
      whatsapp: item.whatsapp,
      authLetter: item.auth_letter_url || '',
      selfie: item.selfie_url || '',
      logo: item.logo_url || '',
      neededDoctors: item.needed_doctors || [],
      jobTypes: item.job_types || [],
      expRange: item.exp_range,
      salaryRange: item.salary_range,
      urgency: item.urgency,
      facilityHighlights: item.facility_highlights,
      hospitalPhotos: item.hospital_photos || [],
      gstNumber: item.gst_number || '',
      plan: item.plan || 'Free',
      createdAt: new Date(item.created_at)
    };
  }
};

const AdminServiceSubmissions = () => {
  const navigate = useNavigate();
  const [firestoreSubmissions, setFirestoreSubmissions] = useState([]);
  const [devershSubmissions, setDevershSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [permissions, setPermissions] = useState([]);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const perms = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    setPermissions(perms);
    setAdminName(localStorage.getItem('adminName') || 'Admin');

    if (!perms.includes('services')) {
      alert('Access Denied: You do not have permission to view Service Submissions.');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // One-way sync: Firestore -> Supabase only (Firestore is the source of truth)
    // Never sync Supabase -> Firestore to prevent re-appearing of deleted records
    const syncFirestoreToSupabase = async () => {
      try {
        const q = query(collection(db, 'serviceForms'));
        const snap = await getDocs(q);
        const firestoreDocs = [];
        snap.forEach(d => {
          firestoreDocs.push({ id: d.id, ...d.data() });
        });

        const categories = [
          { name: 'Doctor Registration', table: 'doctors_registration' },
          { name: 'HR Registration', table: 'hr_registration' },
          { name: 'Hospital Registration', table: 'hospitals_registration' },
          { name: 'Partner Registration', table: 'partner_registration' }
        ];

        for (const cat of categories) {
          const { data: supaData, error: supaErr } = await supabase
            .from(cat.table)
            .select('email');

          if (supaErr) {
            console.error(`Error fetching ${cat.table} from Supabase:`, supaErr);
            continue;
          }

          const supaEmails = new Set((supaData || []).map(s => s.email?.toLowerCase()));
          const catFsDocs = firestoreDocs.filter(d => d.formType === cat.name);

          // Sync ONLY Firestore -> Supabase (not the reverse)
          for (const fsItem of catFsDocs) {
            if (!fsItem.email) continue;
            if (!supaEmails.has(fsItem.email.toLowerCase())) {
              const payload = buildSupabasePayload(fsItem);
              const { error: insErr } = await supabase.from(cat.table).insert([payload]);
              if (insErr) console.error(`Sync fs->supa error for ${cat.name}:`, insErr);
            }
          }
        }
      } catch (err) {
        console.error('Database sync failed:', err);
      }
    };

    syncFirestoreToSupabase();
  }, []);

  useEffect(() => {
    // Real-time listener — updates instantly when a new form is submitted
    const q = query(collection(db, 'serviceForms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setFirestoreSubmissions(data);
      setLoading(false);
    }, (err) => {
      console.error('Snapshot error:', err);
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDeversh = async () => {
      try {
        const { data: devershData, error: devershErr } = await supabase
          .from('deversh_matrimony_profiles')
          .select('*');
        
        if (!devershErr && devershData) {
          const mapped = devershData.map(d => ({
            id: 'deversh_' + d.id,
            formType: 'Deversh Registration',
            fullName: d.full_name,
            name: d.full_name,
            mobile: d.mobile_number,
            city: d.place_of_birth,
            caste: d.caste_community,
            dob: d.dob,
            timeOfBirth: d.time_of_birth,
            height: d.height,
            weight: d.weight,
            address: d.address,
            education: d.education,
            hospitalName: d.hospital_clinic_name,
            income: d.income_annual,
            jobTitle: d.job_details,
            fatherDetails: d.father_name_occupation,
            motherDetails: d.mother_name_occupation,
            brotherDetails: d.brother_details,
            sisterDetails: d.sister_details,
            astrologerMatch: d.astrologer_match_required ? 'Yes' : 'No',
            habits: Array.isArray(d.habits) ? d.habits.join(', ') : d.habits,
            partnerExpectations: d.partner_expectations,
            profilePhotoUrl: d.profile_photo_url,
            certificateUrl: d.certificate_url,
            createdAt: new Date(d.created_at)
          }));
          setDevershSubmissions(mapped);
        } else if (devershErr) {
          console.error('Supabase fetch error:', devershErr);
        }
      } catch (e) {
        console.error('Error fetching Deversh profiles:', e);
      }
    };

    fetchDeversh();
  }, []);

  const formTypes = ['All', 'Doctor Registration', 'Hospital Registration', 'HR Registration', 'Partner Registration', 'Hospital Service Inquiry', 'Contact Inquiry', 'Deversh Registration'];

  const combinedSubmissions = [...firestoreSubmissions, ...devershSubmissions].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });

  const filtered = filter === 'All' ? combinedSubmissions : combinedSubmissions.filter(s => s.formType === filter);

  const handleDelete = async (sub) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        if (sub.formType === 'Deversh Registration' && sub.id.startsWith('deversh_')) {
          // Delete from Supabase specifically for Deversh
          const supaId = sub.id.replace('deversh_', '');
          const { error: supaDeleteErr } = await supabase
            .from('deversh_matrimony_profiles')
            .delete()
            .eq('id', supaId);
            
          if (supaDeleteErr) {
            console.error('Error deleting from Supabase:', supaDeleteErr);
            throw supaDeleteErr;
          }
          
          // Update local state since Deversh might not auto-refresh via Firestore listener
          setDevershSubmissions(prev => prev.filter(s => s.id !== sub.id));
          return;
        }

        // 1. Delete from Firestore — also delete ALL duplicate Firestore docs with same email+formType
        const allDocsQ = query(collection(db, 'serviceForms'));
        const allSnap = await getDocs(allDocsQ);
        const deletePromises = [];
        allSnap.forEach(d => {
          const data = d.data();
          if (
            data.email &&
            data.email?.toLowerCase() === sub.email?.toLowerCase() &&
            data.formType === sub.formType
          ) {
            deletePromises.push(deleteDoc(doc(db, 'serviceForms', d.id)));
          } else if (d.id === sub.id) {
            deletePromises.push(deleteDoc(doc(db, 'serviceForms', d.id)));
          }
        });
        await Promise.all(deletePromises);

        // 2. Delete from Supabase (case-insensitive via ilike)
        let tableName = '';
        if (sub.formType === 'Doctor Registration') tableName = 'doctors_registration';
        else if (sub.formType === 'HR Registration') tableName = 'hr_registration';
        else if (sub.formType === 'Hospital Registration') tableName = 'hospitals_registration';

        if (tableName && sub.email) {
          const { error: supaDeleteErr } = await supabase
            .from(tableName)
            .delete()
            .ilike('email', sub.email);

          if (supaDeleteErr) {
            console.error('Error deleting from Supabase:', supaDeleteErr);
          }
        }
      } catch (err) {
        alert('Error deleting submission: ' + err.message);
      }
    }
  };

  const handleAccept = async (sub) => {
    if (window.confirm(`Are you sure you want to approve ${sub.name || 'this partner'}?`)) {
      try {
        await updateDoc(doc(db, 'serviceForms', sub.id), {
          isAccepted: true
        });
        alert('Partner approved successfully!');
      } catch (err) {
        alert('Error approving partner: ' + err.message);
      }
    }
  };

  const isImageUrl = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const k = key.toLowerCase();
    const isImageField = k.includes('photo') || k.includes('logo') || k.includes('selfie') || k.includes('letter') || k.includes('certificate') || k.includes('url');
    return isImageField && (value.startsWith('http') || value.startsWith('https'));
  };

  const downloadPDF = () => {
    if (filtered.length === 0) { alert('No data to export'); return; }
    const newWin = window.open('', '_blank');
    
    let reportContent = '';
    filtered.forEach((sub, idx) => {
      reportContent += `
        <div class="submission-block" style="page-break-after: always; margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <h3 style="color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            Submission #${idx + 1}: ${sub.formType || 'Registration'}
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            ${Object.entries(sub).map(([key, value]) => {
              if (key === 'id' || key === 'createdAt') return '';
              if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) value = value.join(', ');
                else value = JSON.stringify(value);
              }
              // Clean up keys for display
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              let displayContent = value || '—';
              if (isImageUrl(key, value)) {
                displayContent = `<img src="${value}" style="max-width: 200px; max-height: 150px; border-radius: 4px; display: block; margin-top: 5px;" />`;
              }

              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 30%; color: #4b5563;">${label}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${displayContent}</td>
                </tr>
              `;
            }).join('')}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">Submitted At</td>
              <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${formatDate(sub.createdAt)}</td>
            </tr>
          </table>
        </div>
      `;
    });

    newWin.document.write(`
      <html><head><title>Detailed HRM Service Report</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        h2 { color: #1e3a5f; margin-bottom: 10px; font-size: 24px; }
        .header { margin-bottom: 30px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .submission-block { background: white; }
      </style>
      </head><body>
      <div class="header">
        <h2>HRM Detailed Service Submissions Report</h2>
        <p style="color: #666;">Generated on ${new Date().toLocaleString('en-IN')}</p>
      </div>
      ${reportContent}
      </body></html>
    `);
    newWin.document.close();
    setTimeout(() => { newWin.print(); }, 500);
  };

  const generateMouContent = (sub) => {
    const todayDate = new Date().toLocaleDateString('en-IN');
    const hospitalName = sub.hospitalName || sub.name || '___________';
    return `
      <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; padding: 40px; color: #000; page-break-before: always;">
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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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

        <div style="page-break-before: always;"></div>

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
  };

  const downloadSinglePDF = (sub) => {
    if (!sub) return;
    const newWin = window.open('', '_blank');
    const isPartner = sub.formType === 'Partner Registration';
    
    let reportContent = `
      <div class="submission-block" style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h3 style="color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          ${sub.formType || 'Registration'} Submission Details
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          ${Object.entries(sub).map(([key, value]) => {
            if (key === 'id' || key === 'createdAt') return '';
            if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) value = value.join(', ');
              else value = JSON.stringify(value);
            }
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let displayContent = value || '—';
            if (isImageUrl(key, value)) {
              displayContent = `<img src="${value}" style="max-width: 200px; max-height: 150px; border-radius: 4px; display: block; margin-top: 5px;" />`;
            }
            return `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 30%; color: #4b5563;">${label}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${displayContent}</td>
              </tr>
            `;
          }).join('')}
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #4b5563;">Submitted At</td>
            <td style="padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827;">${formatDate(sub.createdAt)}</td>
          </tr>
        </table>
      </div>
      ${isPartner ? generateMouContent(sub) : ''}
    `;

    const docTitle = `${sub.formType || 'Registration'} - ${sub.name || sub.fullName || sub.hospitalName || sub.contactPerson || 'Detail'}`;

    newWin.document.write(`
      <html><head><title>${docTitle}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        h2 { color: #1e3a5f; margin-bottom: 10px; font-size: 24px; }
        .header { margin-bottom: 30px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .submission-block { background: white; }
      </style>
      </head><body>
      <div class="header">
        <h2>HRM Service Submission Detail</h2>
        <p style="color: #666;">Generated on ${new Date().toLocaleString('en-IN')}</p>
      </div>
      ${reportContent}
      </body></html>
    `);
    newWin.document.close();
    setTimeout(() => { newWin.print(); }, 500);
  };


  const getBadgeClass = (type) => {
    if (!type) return '';
    if (type.includes('Doctor')) return 'badge badge-doctor';
    if (type.includes('Hospital')) return 'badge badge-hospital';
    if (type.includes('HR')) return 'badge badge-hr';
    if (type.includes('Partner')) return 'badge badge-partner';
    if (type.includes('Contact')) return 'badge badge-contact';
    if (type.includes('Deversh')) return 'badge badge-deversh';
    return 'badge';
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminCardId');
    localStorage.removeItem('adminPermissions');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-dashboard-layout">
      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">H</div>
          <div>
            <div className="admin-sidebar-title">HRM Admin</div>
            <div className="admin-sidebar-subtitle">Control Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Main</div>

          {permissions.includes('dashboard') && (
            <Link to="/admin/dashboard" className="admin-nav-item">
              <IconDashboard /> Overview
            </Link>
          )}
          {permissions.includes('services') && (
            <a href="/admin/services" className="admin-nav-item active">
              <IconClipboard /> Service Submissions
            </a>
          )}

          <div className="admin-nav-divider" />
          <div className="admin-nav-section-label">Manage</div>

          {permissions.includes('leads') && (
            <a href="/admin/leads" className="admin-nav-item">
              <IconUsers /> Users & Leads
            </a>
          )}
          {permissions.includes('blogs') && (
            <a href="/admin/blogs" className="admin-nav-item">
              <IconEdit /> Blog Manager
            </a>
          )}

          {permissions.includes('adminAccess') && (
            <Link to="/admin/dashboard?tab=accounts" className="admin-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Access
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

      {/* Main */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>Service Submissions</h1>
            <p>View & manage client registration data</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-records-badge">
              <span>{filtered.length}</span> Records
            </div>
            <button className="admin-download-btn" onClick={downloadPDF}>
              <Download size={14} /> Download PDF
            </button>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>

        <div className="admin-content-area">

          {/* Filter tabs */}
          <div className="admin-filter-tabs">
            {formTypes.map(t => (
              <button
                key={t}
                className={`admin-filter-tab ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-service-loading">⏳ Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📭</div>
              <h3>No Submissions Yet</h3>
              <p>When clients fill out registration forms, their data will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table id="service-table" className="admin-service-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Form Type</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Submitted At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className={getBadgeClass(sub.formType)}>
                          {sub.formType || '—'}
                        </span>
                      </td>
                      <td>{sub.name || sub.fullName || sub.hospitalName || sub.contactPerson || '—'}</td>
                      <td>{sub.email || '—'}</td>
                      <td>{sub.mobile || sub.phone || '—'}</td>
                      <td>{sub.city || sub.currentCity || (sub.formType === 'Partner Registration' ? sub.specialties?.split(',')[0]?.trim() : '—') || '—'}</td>
                      <td>{formatDate(sub.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {sub.formType === 'Partner Registration' && !sub.isAccepted && (
                            <button 
                              className="admin-accept-btn" 
                              title="Accept Partner"
                              style={{ color: '#10b981', background: '#ecfdf5', border: '1px solid #10b981', padding: '4px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              onClick={() => handleAccept(sub)}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {sub.formType === 'Partner Registration' && sub.isAccepted && (
                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center' }} title="Approved">
                              <CheckCircle size={16} />
                            </span>
                          )}
                          <button 
                            className="admin-view-btn" 
                            title="View Details"
                            onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="admin-download-single-btn" 
                            title="Download Details as PDF"
                            onClick={() => downloadSinglePDF(sub)}
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            className="admin-delete-btn" 
                            title="Delete Submission"
                            onClick={() => handleDelete(sub)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Details Modal */}
          {isModalOpen && selectedSub && (
            <div className="admin-modal-overlay">
              <div className="admin-modal-content">
                <div className="admin-modal-header">
                  <h3>Full Submission Details</h3>
                  <button onClick={() => setIsModalOpen(false)}>×</button>
                </div>
                <div className="admin-modal-body">
                  <div className="detail-type-badge">
                    <span className={getBadgeClass(selectedSub.formType)}>
                      {selectedSub.formType}
                    </span>
                  </div>
                  <table className="details-display-table">
                    <tbody>
                      {Object.entries(selectedSub).map(([key, value]) => {
                        if (key === 'id' || key === 'createdAt') return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        let displayValue = value;
                        if (Array.isArray(value)) displayValue = value.join(', ');
                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                        if (
                          key.toLowerCase().includes('photo') || 
                          key.toLowerCase().includes('logo') || 
                          key.toLowerCase().includes('selfie') || 
                          key.toLowerCase().includes('letter') || 
                          key.toLowerCase().includes('certificate') ||
                          key.toLowerCase().includes('url')
                        ) {
                          if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
                            displayValue = (
                              <div className="admin-img-preview-container">
                                <img src={value} alt={label} className="admin-detail-img" />
                                <a href={value} target="_blank" rel="noreferrer" className="img-link">
                                  🔍 View Full Size
                                </a>
                              </div>
                            );
                          }
                        }
                        return (
                          <tr key={key}>
                            <td className="label-td">{label}</td>
                            <td className="value-td">{displayValue || '—'}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td className="label-td">Submitted At</td>
                        <td className="value-td">{formatDate(selectedSub.createdAt)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="admin-modal-footer">
                  <button onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminServiceSubmissions;
