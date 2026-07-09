import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, getDocs, addDoc } from 'firebase/firestore';
import { supabase } from '../lib/supabase';
import { Trash2, Eye, Download, Info } from 'lucide-react';
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
  const [submissions, setSubmissions] = useState([]);
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
      setSubmissions(data);
      setLoading(false);
    }, (err) => {
      console.error('Snapshot error:', err);
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  const formTypes = ['All', 'Doctor Registration', 'Hospital Registration', 'HR Registration', 'Partner Registration', 'Contact Inquiry'];

  const filtered = filter === 'All' ? submissions : submissions.filter(s => s.formType === filter);

  const handleDelete = async (sub) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        // 1. Delete from Firestore — also delete ALL duplicate Firestore docs with same email+formType
        const allDocsQ = query(collection(db, 'serviceForms'));
        const allSnap = await getDocs(allDocsQ);
        const deletePromises = [];
        allSnap.forEach(d => {
          const data = d.data();
          if (
            data.email?.toLowerCase() === sub.email?.toLowerCase() &&
            data.formType === sub.formType
          ) {
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
            .filter('email', 'ilike', sub.email);

          if (supaDeleteErr) {
            console.error('Error deleting from Supabase:', supaDeleteErr);
          }
        }
      } catch (err) {
        alert('Error deleting submission: ' + err.message);
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

  const generateMouContent = (sub) => `
    <div style="page-break-before: always; font-family: 'Noto Sans Gujarati', 'Arial Unicode MS', Arial, sans-serif; line-height: 1.9; color: #111; padding: 0 20px;">
      <div style="text-align:center; border-bottom: 3px double #1e3a5f; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color:#1e3a5f; font-size:20px; margin:0;">HRM CONSULTANCY DOCTORS CHOICE</h2>
        <p style="margin:4px 0; font-size:13px; color:#555;">Memorandum of Understanding (MOU) – HRM Network Partner</p>
        <p style="margin:4px 0; font-size:13px;"><strong>Hospital / Partner:</strong> ${sub.hospitalName || sub.name || '___________'} &nbsp;|&nbsp; <strong>License No:</strong> ${sub.licenseNumber || '___________'}</p>
        <p style="margin:4px 0; font-size:13px;"><strong>Contact:</strong> ${sub.contactPerson || '___________'} &nbsp;|&nbsp; <strong>Email:</strong> ${sub.email || '___________'} &nbsp;|&nbsp; <strong>Phone:</strong> ${sub.phone || '___________'}</p>
        <p style="margin:4px 0; font-size:13px;"><strong>Specialties:</strong> ${sub.specialties || '___________'} &nbsp;|&nbsp; <strong>Total Beds:</strong> ${sub.totalBeds || '___'} &nbsp;|&nbsp; <strong>ICU Beds:</strong> ${sub.icuBeds || '___'}</p>
      </div>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">1. સંબંધની પ્રકૃતિ અને કાનૂની સ્થિતિ</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>1.1 આ MOU માત્ર માર્કેટિંગ ભાગીદારી અને પેશન્ટ રેફરલ સેવાઓ માટે જ છે.</li>
        <li>1.2 HRM એક સ્વતંત્ર માર્કેટિંગ ભાગીદાર છે. HRM એ હોસ્પિટલનું મેનેજમેન્ટ, વહીવટકર્તા, ઓપરેટર, ભાગીદાર કે માલિક નથી.</li>
        <li>1.3 કોઈ ક્લિનિકલ ભૂમિકા નહીં: તમામ ક્લિનિકલ, તબીબી, વહીવટી, નાણાકીય અથવા ઓપરેશનલ કાર્યોની સંપૂર્ણ જવાબદારી માત્ર હોસ્પિટલની રહેશે.</li>
        <li>1.4 આ MOU ભાગીદારી, Joint Venture, એજન્સી અથવા માલિક-કર્મચારીના સંબંધની રચના કરતું નથી.</li>
        <li>1.5 HRM એક સ્વતંત્ર સંસ્થા છે અને હોસ્પિટલની SOPs, નીતિઓ, નિયમો કે સૂચનાઓથી બંધાયેલ રહેશે નહીં.</li>
        <li>1.6 HRM, CEA Act 2010, NMC Act 2019 અથવા IRDAI Act 1999 હેઠળ નોંધાયેલ નથી અને ક્લિનિકલ સેવા પ્રદાન કરશે નહીં.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">2. HRM દ્વારા આપવામાં આવતી સેવાઓ</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>2.1 દર્દી રેફરલ: HRM માર્કેટિંગ નેટવર્ક દ્વારા દર્દીઓ મોકલશે. સૂચક ટાર્ગેટ: 30 સર્જિકલ + 70 OPD = 100 દર્દીઓ (ગેરંટી નહીં).</li>
        <li>2.2 HRM Privilege Card: HRM સભ્યોને "HRM Privilege Card" ઈશ્યૂ કરશે. આ કાર્ડ માત્ર Membership Card છે, Insurance Product નથી.</li>
        <li>2.3 HRM પોતાના ખર્ચે ડિજિટલ, પ્રિન્ટ અને ફિલ્ડ માર્કેટિંગ દ્વારા હોસ્પિટલનો પ્રચાર કરશે.</li>
        <li>2.4 HRM કાર્ડ ધારક દર્દીઓને Zero Waiting Time OPD Consultation આપવા માટે હોસ્પિટલ સંમત થાય છે.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">3. HRM Privilege Card – નીતિ અને ડિસ્કાઉન્ટ</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>3.1 HRM Privilege Card રજૂ કર્યા પછી જ ડિસ્કાઉન્ટ લાગુ. "Card નહીં તો Discount નહીં."</li>
        <li>3.2 હોસ્પિટલ 10% ડિસ્કાઉન્ટ આ સેવાઓ પર આપશે: (a) In-house ફાર્મસી, (b) In-house Diagnostic/Lab, (c) OPD Consultation, (d) Surgery Package.</li>
        <li>3.4 બિલમાં અલગ Line Item: "Less: 10% HRM Privilege Card BENEFITS – Rs. XXX" ફરજિયાત.</li>
        <li>3.5 સરકારી વાંધો પડ્યે હોસ્પિટલ 7 દિવસમાં HRM Branding હટાવી દેશે.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">4. આવકની વહેંચણી</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>4.1 Trial Period: પ્રથમ 100 HRM-Referred & Billed દર્દીઓ માટે HRM ₹0 ચાર્જ કરશે.</li>
        <li>4.2 101મા દર્દીથી: Gross Billed Value ના 25% માર્કેટિંગ ફી HRM ને ચૂકવવાની.</li>
        <li>4.3 ગણતરી: 10% Discount બાદ કરવા પહેલા અને GST ઉમેરતા પહેલાની રકમ પર.</li>
        <li>4.4 HRM દર મહિને 5 તારીખ સુધીમાં Invoice મોકલશે; હોસ્પિટલ 10 દિવસમાં NEFT/RTGS ચૂકવણી કરશે.</li>
        <li>4.5 "HRM Privilege Card BENEFITS" Line Item ધરાવતા દર્દીઓ જ HRM-Referred ગણાશે.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">5. બ્રાન્ડિંગ, માર્કેટિંગ અને પાલન</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>5.1 HRM-Approved Branding Material ની Design & Installation નો એક વખતનો ખર્ચ હોસ્પિટલ ભોગવશે.</li>
        <li>5.2 Setup પછીના તમામ Marketing/Campaign ખર્ચ 100% HRM ભોગવશે.</li>
        <li>5.3 સાઇન કર્યાના 7 દિવસમાં હોસ્પિટલ HRM ને આ આપશે: (a) High-Res Logo, (b) On-roll Doctor List, (c) Services List, (d) CEA Certificate & GP List with Contacts.</li>
        <li>5.4 HRM Branding ફક્ત Ground Floor/Reception Level પર; Font Size મુખ્ય Name Board ના 50% થી વધુ નહીં. Disclaimer ફરજિયાત: "HRM Privilege Card માત્ર Discount Membership Card છે. IRDAI દ્વારા નિયંત્રિત નથી."</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">6. વૈધાનિક પાલન – Annexure-A</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>6.1 Annexure-A: Hospital License Checklist ભરી, સહી-સિક્કો કરી HRM ને Submit કરવી – ફરજિયાત પૂર્વ શરત.</li>
        <li>6.2 LEVEL 1 License ગુમ/Invalid/Expired હોય તો હોસ્પિટલ તરત HRM ને જાણ કરે.</li>
        <li>6.3 HRM, Annexure-A મળ્યા પછી 3 Working Days માં "YES – MOU Active" અથવા "NO – MOU Not Active" જવાબ આપશે. MOU ત્યારે જ Effective બને.</li>
        <li>6.4 LEVEL 1 Licenses Validity Renewal ની Copy 15 દિવસ પહેલા HRM ને આપવી.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">7. મુદત, Lock-in અને સમાપ્તિ</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>7.1 HRM ના "YES" ની તારીખથી 36 મહિના માટે MOU માન્ય.</li>
        <li>7.2 Activation પછી 3 મહિના Lock-in Period; ગંભીર ઉલ્લંઘન સિવાય Terminate નહીં.</li>
        <li>7.3 Lock-in પછી 30 દિવસની Notice આપી MOU સમાપ્ત કરી શકાય.</li>
        <li>7.4 HRM ને CEA License રદ/ઉલ્લંઘનના કિસ્સામાં Immediate Termination નો અધિકાર.</li>
        <li>7.5 Termination ઉપર: HRM Branding 7 દિવસ, બાકી રકમ 15 દિવસ.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">8. નુકસાની, જવાબદારી અને ડેટા સુરક્ષા</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>8.1 Medical Negligence, Medico-Legal Cases, CEA/NMC/IRDAI ઉલ્લંઘન — સંપૂર્ણ જવાબદારી હોસ્પિટલની.</li>
        <li>8.2 HRM ની મહત્તમ જવાબદારી અગાઉ 3 મહિનાની Marketing Fee પૂરતી. Clinical/Patient death/Outcome માટે HRM જવાબદાર નહીં.</li>
        <li>8.3 Hospital પાસે Valid Professional Indemnity Insurance હોવો ફરજિયાત.</li>
        <li>8.4 Patient Medical/Billing Data Hospital ની Custody. HRM ને Clinical Data Access નહીં. DPDP Act 2023 પાલન ફરજિયાત.</li>
      </ul>

      <h3 style="color:#1e3a5f; font-size:15px; border-left:4px solid #3b82f6; padding-left:10px;">9–11. ગોપનીયતા, વિવાદ અને પરચૂરણ</h3>
      <ul style="padding-left:20px; font-size:13px;">
        <li>9.1 બંને પક્ષ તમામ વ્યાવસાયિક શરતો ગુપ્ત રાખશે.</li>
        <li>9.2 MOU Period + 12 મહિના: HRM Referred Patients/Corporate Clients ને Bypass (Direct Contact) નહીં.</li>
        <li>10.1 વિવાદો 15 દિવસ Amicably ઉકેલવા. ઉકેલ ન થાય તો Rajkot, Gujarat Court Jurisdiction.</li>
        <li>11. કોઈ સુધારો Written + Signed હોવો જોઈએ. Force Majeure: Natural Calamity/Pandemic/Government Order ને કારણે Failure માટે કોઈ પક્ષ જવાબદાર નહીં.</li>
      </ul>

      <div style="margin-top:40px; border-top:2px solid #1e3a5f; padding-top:20px; font-size:13px;">
        <div style="display:flex; justify-content:space-between; gap:40px;">
          <div style="flex:1; border:1px solid #ccc; border-radius:8px; padding:20px;">
            <p style="font-weight:700; color:#1e3a5f; margin-bottom:8px;">હોસ્પિટલ વતી (For HOSPITAL)</p>
            <p>અધિકૃત હસ્તાક્ષરકર્તા</p>
            <p>નામ: <span style="border-bottom:1px solid #333; display:inline-block; min-width:160px;">&nbsp;${sub.contactPerson || ''}</span></p>
            <p>હોદ્દો: <span style="border-bottom:1px solid #333; display:inline-block; min-width:140px;">&nbsp;</span></p>
            <p>તારીખ: <span style="border-bottom:1px solid #333; display:inline-block; min-width:140px;">&nbsp;</span></p>
            <p>સિક્કો:</p>
            <div style="margin-top:60px; border-top:1px solid #333; width:200px;"></div>
          </div>
          <div style="flex:1; border:1px solid #ccc; border-radius:8px; padding:20px;">
            <p style="font-weight:700; color:#1e3a5f; margin-bottom:8px;">એચ.આર.એમ. કન્સલ્ટન્સી ડોક્ટર્સ ચોઈસ વતી</p>
            <p>અધિકૃત હસ્તાક્ષરકર્તા</p>
            <p>નામ: <strong>શ્રી નીરવ પુંડ્યા</strong></p>
            <p>હોદ્દો: <strong>પ્રોપ્રાઈટર</strong></p>
            <p>તારીખ: <span style="border-bottom:1px solid #333; display:inline-block; min-width:140px;">&nbsp;</span></p>
            <p>સિક્કો:</p>
            <div style="margin-top:60px; border-top:1px solid #333; width:200px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

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
          {permissions.includes('qrStats') && (
            <Link to="/admin/dashboard?tab=qr-stats" className="admin-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              QR Stats
            </Link>
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
