"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Globe, Sliders, Eye, Trash2, Key, Save, Loader, Check, 
  UploadCloud, Mail, Phone, Shield, Landmark, MapPin, Truck 
} from 'lucide-react';

const FacebookIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
);
const TwitterIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);
const WhatsappIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
  </svg>
);

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Company Profile states
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyGst, setCompanyGst] = useState('');
  const [swedenOffice, setSwedenOffice] = useState('');
  const [globalOffices, setGlobalOffices] = useState(['']);
  const [marketedBy, setMarketedBy] = useState('');
  const [marketingOfficeAddr, setMarketingOfficeAddr] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [invoiceStartNo, setInvoiceStartNo] = useState('');
  const [consultationPrefix, setConsultationPrefix] = useState('');
  const [consultationStartNo, setConsultationStartNo] = useState('');
  const [authorizedSignature, setAuthorizedSignature] = useState('');
  // Banking states
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankUpiId, setBankUpiId] = useState('');
  const [bankShowQr, setBankShowQr] = useState(true);
  const [bankQrType, setBankQrType] = useState('dynamic');
  const [bankStaticQrImage, setBankStaticQrImage] = useState('');
  const [bankUpiProvider, setBankUpiProvider] = useState('all');
  const [uploadingQr, setUploadingQr] = useState(false);

  // Courier Partners states
  const [courierPartners, setCourierPartners] = useState([]);
  const [courierEditId, setCourierEditId] = useState(null);
  const [courierName, setCourierName] = useState('');
  const [courierAddress, setCourierAddress] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierEmail, setCourierEmail] = useState('');
  const [courierContactPerson, setCourierContactPerson] = useState('');
  const [courierContactPhone, setCourierContactPhone] = useState('');

  // Logo config states
  const [logoExists, setLogoExists] = useState(false);
  const [logoHeight, setLogoHeight] = useState(48);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const fileInputRef = useRef(null);

  // Social config states
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Admin Credentials states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Company & Admin Settings
      const setRes = await fetch('/api/admin/settings');
      if (setRes.ok) {
        const settings = await setRes.json();
        setCompanyName(settings.company_name || '');
        setCompanyAddress(settings.company_address || '');
        setCompanyPhone(settings.company_phone || '');
        setCompanyEmail(settings.company_email || '');
        setCompanyGst(settings.company_gst || '');
        setSwedenOffice(settings.sweden_office || '');
        setGlobalOffices(settings.global_offices || ['']);
        setMarketedBy(settings.marketed_by || '');
        setMarketingOfficeAddr(settings.marketing_office_addr || '');
        setTermsConditions(settings.terms_conditions || '');
        setInvoicePrefix(settings.invoice_prefix || '');
        setInvoiceStartNo(settings.invoice_start_no !== undefined ? String(settings.invoice_start_no) : '');
        setConsultationPrefix(settings.consultation_prefix || 'CNS-2026-');
        setConsultationStartNo(settings.consultation_start_no !== undefined ? String(settings.consultation_start_no) : '1001');
        setAuthorizedSignature(settings.authorized_signature || '');
        setBankName(settings.bank_name || '');
        setBankAccountNo(settings.bank_account_no || '');
        setBankAccountName(settings.bank_account_name || '');
        setBankIfsc(settings.bank_ifsc || '');
        setBankBranch(settings.bank_branch || '');
        setBankUpiId(settings.bank_upi_id || '');
        setBankShowQr(settings.bank_show_qr !== false);
        setBankQrType(settings.bank_qr_type || 'dynamic');
        setBankStaticQrImage(settings.bank_static_qr_image || '');
        setBankUpiProvider(settings.bank_upi_provider || 'all');
        setCourierPartners(settings.courier_partners || []);
        setAdminEmail(settings.admin_email || '');
        setAdminPassword(settings.admin_password || '');
        setConfirmPassword(settings.admin_password || '');
      }

      // 2. Fetch Logo settings
      const logoRes = await fetch('/api/admin/logo');
      if (logoRes.ok) {
        const logoData = await logoRes.json();
        setLogoExists(logoData.exists);
        if (logoData.height) {
          setLogoHeight(Number(logoData.height));
        }
      }

      // 3. Fetch Social links settings
      const socRes = await fetch('/api/admin/frontend');
      if (socRes.ok) {
        const socData = await socRes.json();
        setFacebook(socData.facebook || '');
        setInstagram(socData.instagram || '');
        setLinkedin(socData.linkedin || '');
        setYoutube(socData.youtube || '');
        setTwitter(socData.twitter || '');
        setWhatsapp(socData.whatsapp || '');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve settings configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveCompany = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const cleanedGlobalOffices = globalOffices.filter(o => o.trim() !== '');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          company_address: companyAddress,
          company_phone: companyPhone,
          company_email: companyEmail,
          company_gst: companyGst,
          global_offices: cleanedGlobalOffices,
          marketed_by: marketedBy,
          marketing_office_addr: marketingOfficeAddr,
          terms_conditions: termsConditions,
          invoice_prefix: invoicePrefix,
          invoice_start_no: invoiceStartNo ? parseInt(invoiceStartNo, 10) : 1001,
          consultation_prefix: consultationPrefix,
          consultation_start_no: consultationStartNo ? parseInt(consultationStartNo, 10) : 1001,
          authorized_signature: authorizedSignature
        })
      });
      if (!res.ok) throw new Error('Failed to save company profile');
      setGlobalOffices(cleanedGlobalOffices.length > 0 ? cleanedGlobalOffices : ['']);
      alert('Company profile settings saved successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving company settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanking = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          bank_account_no: bankAccountNo,
          bank_account_name: bankAccountName,
          bank_ifsc: bankIfsc,
          bank_branch: bankBranch,
          bank_upi_id: bankUpiId,
          bank_show_qr: bankShowQr,
          bank_qr_type: bankQrType,
          bank_static_qr_image: bankStaticQrImage,
          bank_upi_provider: bankUpiProvider
        })
      });
      if (!res.ok) throw new Error('Failed to save banking details');
      alert('Banking details saved successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving banking details.');
    } finally {
      setSaving(false);
    }
  };

  const handleQrImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingQr(true);
      setError(null);
      const base64WebP = await processImageToWebpBase64(file);
      setBankStaticQrImage(base64WebP);
      alert('Static QR Code uploaded to settings state! Remember to click "Save Banking Details" below to save permanently.');
    } catch (err) {
      console.error(err);
      setError('Error occurred during QR image upload.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setError(null);
      const base64WebP = await processImageToWebpBase64(file);
      setAuthorizedSignature(base64WebP);
      alert('Signature uploaded to settings state! Remember to click "Save Company Profile" below to save permanently.');
    } catch (err) {
      console.error(err);
      setError('Error occurred during signature image upload.');
    }
  };

  const handleAddCourier = (e) => {
    if (e) e.preventDefault();
    if (!courierName.trim()) {
      alert('Courier Name is required.');
      return;
    }

    const newPartner = {
      id: courierEditId || Date.now(),
      name: courierName.trim(),
      address: courierAddress.trim(),
      phone: courierPhone.trim(),
      email: courierEmail.trim(),
      contact_person: courierContactPerson.trim(),
      contact_phone: courierContactPhone.trim()
    };

    let updatedList;
    if (courierEditId) {
      updatedList = courierPartners.map(p => p.id === courierEditId ? newPartner : p);
    } else {
      updatedList = [...courierPartners, newPartner];
    }

    setCourierPartners(updatedList);
    resetCourierForm();
  };

  const resetCourierForm = () => {
    setCourierEditId(null);
    setCourierName('');
    setCourierAddress('');
    setCourierPhone('');
    setCourierEmail('');
    setCourierContactPerson('');
    setCourierContactPhone('');
  };

  const handleEditCourierClick = (partner) => {
    setCourierEditId(partner.id);
    setCourierName(partner.name || '');
    setCourierAddress(partner.address || '');
    setCourierPhone(partner.phone || '');
    setCourierEmail(partner.email || '');
    setCourierContactPerson(partner.contact_person || '');
    setCourierContactPhone(partner.contact_phone || '');
  };

  const handleDeleteCourier = (id) => {
    if (confirm('Are you sure you want to remove this courier partner?')) {
      const updatedList = courierPartners.filter(p => p.id !== id);
      setCourierPartners(updatedList);
      if (courierEditId === id) {
        resetCourierForm();
      }
    }
  };

  const handleSaveCouriersToServer = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courier_partners: courierPartners
        })
      });
      if (!res.ok) throw new Error('Failed to save courier partners');
      alert('Courier partners settings saved successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving courier partners.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLogoHeight = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height: logoHeight })
      });
      if (!res.ok) throw new Error('Failed to update logo display dimensions');
      alert('Store logo display height updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving logo dimensions.');
    } finally {
      setSaving(false);
    }
  };

  const processImageToWebpBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 500;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const webpBase64 = canvas.toDataURL('image/webp', 0.95);
          resolve(webpBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      setError(null);
      const base64WebP = await processImageToWebpBase64(file);
      const res = await fetch('/api/admin/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64WebP })
      });
      if (!res.ok) throw new Error('Failed to upload logo image file.');
      setLogoExists(true);
      setCacheBuster(Date.now());
      alert('Logo uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred during logo file upload.');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm('Revert brand logo? The storefront headers will return to standard text.')) {
      return;
    }
    try {
      setDeletingLogo(true);
      setError(null);
      const res = await fetch('/api/admin/logo', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete active logo image.');
      setLogoExists(false);
      alert('Logo deleted successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while purging logo.');
    } finally {
      setDeletingLogo(false);
    }
  };

  const handleSaveSocials = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook, instagram, linkedin, youtube, twitter, whatsapp
        })
      });
      if (!res.ok) throw new Error('Failed to update social configurations');
      alert('Social profile links updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving social parameters.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdminAccess = async (e) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim()) {
      alert('Please fill out the administrative email/username.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      alert('Administrative passwords do not match. Please verify.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: adminEmail,
          admin_password: adminPassword
        })
      });
      if (!res.ok) throw new Error('Failed to update administrator credentials');
      alert('Administrative credentials updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving access profiles.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader size={40} className="animate-spin text-vedicana-gold" />
        <span className="text-sm font-semibold">Loading system settings console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm animate-fadeIn">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block animate-pulse"></span>
            System Settings Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1">Directly manage core organization settings, customize storefront brand image files, sync social profiles, and configure credentials.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Settings Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs List Panel - Left Column */}
        <div className="md:col-span-3 bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-2 space-y-1">
          <button
            onClick={() => setActiveTab('company')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'company'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-3'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 size={16} />
            Company Profile
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer pl-6 ${
              activeTab === 'banking'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-5'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Landmark size={16} />
            Banking Details
          </button>
          
          <button
            onClick={() => setActiveTab('courier')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer pl-6 ${
              activeTab === 'courier'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-5'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Truck size={16} />
            Courier Partners
          </button>
          
          <button
            onClick={() => setActiveTab('logo')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'logo'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-3'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UploadCloud size={16} />
            Store Logo Settings
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-3'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Globe size={16} />
            Social Profiles
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-vedicana-green/20 text-vedicana-green border-l-4 border-vedicana-green pl-3'
                : 'text-slate-450 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Key size={16} />
            Admin Access Profile
          </button>
        </div>

        {/* Selected Form Content Panel - Right Column */}
        <div className="md:col-span-9 bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl min-h-[400px]">
          
          {/* 1. Tab: Company Profile */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-6 animate-fadeIn">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                <Landmark className="text-vedicana-green" size={16} />
                Corporate Entity Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Company Name</label>
                  <input 
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. VediCana Organics"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">GST Registration Number</label>
                  <input 
                    type="text"
                    value={companyGst}
                    onChange={(e) => setCompanyGst(e.target.value)}
                    placeholder="e.g. 24AAAAA0000A1Z5"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-500" /> Customer Support Phone
                  </label>
                  <input 
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="e.g. +91 94372 72884"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-500" /> Support Contact Email
                  </label>
                  <input 
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="e.g. support@vedicana.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Marketed By</label>
                  <input 
                    type="text"
                    value={marketedBy}
                    onChange={(e) => setMarketedBy(e.target.value)}
                    placeholder="e.g. VediCana Wellness Pvt. Ltd."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Invoice Serial Prefix</label>
                  <input 
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="e.g. INV-2026-"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block truncate" title="Invoice Starting Number">Inv Starting No</label>
                    <input 
                      type="number"
                      value={invoiceStartNo}
                      onChange={(e) => setInvoiceStartNo(e.target.value)}
                      placeholder="e.g. 1001"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block truncate" title="Consultation Prefix">Consl. Prefix</label>
                    <input 
                      type="text"
                      value={consultationPrefix}
                      onChange={(e) => setConsultationPrefix(e.target.value)}
                      placeholder="CNS-2026-"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block truncate" title="Consultation Serial Number">Consl. Srl No</label>
                    <input 
                      type="number"
                      value={consultationStartNo}
                      onChange={(e) => setConsultationStartNo(e.target.value)}
                      placeholder="e.g. 1001"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-500" /> Marketing Office Address
                  </label>
                  <textarea 
                    value={marketingOfficeAddr}
                    onChange={(e) => setMarketingOfficeAddr(e.target.value)}
                    placeholder="Marketing office address details..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-500" /> India Head Office Address (GST Registered)
                  </label>
                  <textarea 
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Headquarters street location address..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-500" /> Only Global Partner Offices
                  </label>
                  {globalOffices.map((office, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <textarea 
                        value={office}
                        onChange={(e) => {
                          const newOffices = [...globalOffices];
                          newOffices[index] = e.target.value;
                          setGlobalOffices(newOffices);
                        }}
                        placeholder="Global partner office address..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      />
                      {globalOffices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOffices = globalOffices.filter((_, i) => i !== index);
                            setGlobalOffices(newOffices);
                          }}
                          className="bg-red-950/40 hover:bg-red-900/60 text-red-400 p-2.5 rounded-lg border border-red-900/20 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGlobalOffices([...globalOffices, ''])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-vedicana-green bg-vedicana-green/10 hover:bg-vedicana-green/20 px-3 py-1.5 rounded-lg border border-vedicana-green/20 cursor-pointer transition-colors"
                  >
                    + Add Office Address
                  </button>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <Shield size={12} className="text-slate-500" /> Terms & Conditions
                  </label>
                  <textarea 
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    placeholder="Standard terms and conditions for transactions..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block flex items-center gap-1.5">
                    <UploadCloud size={12} className="text-slate-500" /> Authorized Signatory Signature (Invoices)
                  </label>
                  <p className="text-[10px] text-slate-500">Upload your authorized signature image (JPEG, PNG). It will be compressed to WebP and printed on tax invoices.</p>
                  <div className="flex items-center gap-4 mt-1">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      id="signature-upload-input"
                    />
                    <label 
                      htmlFor="signature-upload-input"
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-white rounded-lg px-4 py-2.5 text-xs cursor-pointer font-semibold transition-all inline-flex items-center gap-1.5 select-none"
                    >
                      <UploadCloud size={14} /> Choose Signature File
                    </label>
                    {authorizedSignature && (
                      <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 p-2 rounded-lg">
                        <img src={authorizedSignature} alt="Signature Preview" className="h-10 w-auto object-contain bg-white px-2 py-1 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete uploaded signature?')) {
                              setAuthorizedSignature('');
                            }
                          }}
                          className="text-red-400 hover:text-red-300 p-1.5 bg-red-950/20 hover:bg-red-950/40 rounded border border-red-900/10 cursor-pointer inline-flex items-center"
                          title="Remove signature"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
                Save Company Profile
              </button>
            </form>
          )}

          {/* 6. Tab: Banking Details */}
          {activeTab === 'banking' && (
            <form onSubmit={handleSaveBanking} className="space-y-6 animate-fadeIn">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                <Landmark className="text-vedicana-green" size={16} />
                Corporate Banking & UPI Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Bank Name</label>
                  <input 
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Account Name</label>
                  <input 
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="e.g. VediCana Wellness Pvt. Ltd."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Account Number</label>
                  <input 
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="e.g. 30091283749"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">IFSC Code</label>
                  <input 
                    type="text"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value)}
                    placeholder="e.g. SBIN0001234"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Branch Name</label>
                  <input 
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="e.g. Makarpura GIDC Branch"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">UPI ID (for scan to collect payments)</label>
                  <input 
                    type="text"
                    value={bankUpiId}
                    onChange={(e) => setBankUpiId(e.target.value)}
                    placeholder="e.g. vedicana@sbi"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 flex items-center gap-3 pt-2 md:col-span-2">
                  <input 
                    type="checkbox"
                    id="bankShowQr"
                    checked={bankShowQr}
                    onChange={(e) => setBankShowQr(e.target.checked)}
                    className="w-4 h-4 bg-slate-900 border border-slate-800 focus:border-vedicana-green rounded text-vedicana-green focus:ring-0 focus:ring-offset-0 accent-vedicana-green cursor-pointer"
                  />
                  <label htmlFor="bankShowQr" className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
                    Show Payment QR Code on Tax Invoice
                  </label>
                </div>

                {bankShowQr && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">QR Code Source</label>
                      <select 
                        value={bankQrType}
                        onChange={(e) => setBankQrType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="dynamic">Dynamic UPI QR Code (Auto-calculates order total)</option>
                        <option value="static">Static Merchant QR Code Image (Standard standalone scan)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Preferred Payment Brand/Scanner Label</label>
                      <select 
                        value={bankUpiProvider}
                        onChange={(e) => setBankUpiProvider(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="all">Show All (GPay / PhonePe / Paytm / BHIM)</option>
                        <option value="gpay">Google Pay Scan Instructions</option>
                        <option value="phonepe">PhonePe Scan Instructions</option>
                        <option value="paytm">Paytm Scan Instructions</option>
                        <option value="none">Generic UPI Scan Instructions</option>
                      </select>
                    </div>

                    {bankQrType === 'static' && (
                      <div className="md:col-span-2 bg-slate-900/40 p-4 border border-slate-800 rounded-lg space-y-3">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Upload Static Merchant QR Code</label>
                        <p className="text-[11px] text-slate-450">Upload your permanent Google Pay, PhonePe, or BHIM business QR code image. The system will encode and resize it to display on the invoice.</p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleQrImageUpload}
                            disabled={uploadingQr}
                            className="bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg p-2 text-xs text-slate-350 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                          {uploadingQr && (
                            <span className="text-xs text-vedicana-gold flex items-center gap-1.5"><Loader className="animate-spin" size={12} /> Compressing file...</span>
                          )}
                          {bankStaticQrImage && (
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-850">
                              <img src={bankStaticQrImage} alt="Static QR Preview" className="w-16 h-16 object-contain rounded bg-white" />
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (confirm('Delete uploaded static QR image?')) {
                                    setBankStaticQrImage('');
                                  }
                                }} 
                                className="bg-red-950/40 hover:bg-red-900/60 text-red-400 p-2 rounded border border-red-900/20 text-xs font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed text-slate-400 space-y-2">
                <span className="font-bold text-slate-300 block uppercase tracking-widest flex items-center gap-1">ℹ️ Quick Note</span>
                <p>When UPI ID is configured, the system dynamically converts the grand total of the customer's tax invoice into a dynamic payment collect QR code displayed directly on the invoice document. This allows consumers to scan and make payments via GPay, PhonePe, Paytm, or BHIM UPI.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
                Save Banking Details
              </button>
            </form>
          )}

          {/* Tab: Courier Partners */}
          {activeTab === 'courier' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                  <Truck className="text-vedicana-green" size={16} />
                  Courier Partners Management
                </h3>
                <button
                  type="button"
                  onClick={handleSaveCouriersToServer}
                  disabled={saving}
                  className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
                  Save Courier Partners
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form to Add/Edit */}
                <form onSubmit={handleAddCourier} className="lg:col-span-5 bg-slate-900/40 p-4 border border-slate-800 rounded-lg space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-305">
                    {courierEditId ? 'Edit Courier Partner' : 'Add Courier Partner'}
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Courier Name</label>
                    <input 
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Delhivery, Bluedart"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Address</label>
                    <textarea 
                      value={courierAddress}
                      onChange={(e) => setCourierAddress(e.target.value)}
                      placeholder="Courier office address (optional)..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Phone No</label>
                    <input 
                      type="text"
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      placeholder="e.g. +91 11-4500-0000 (optional)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Email</label>
                    <input 
                      type="email"
                      value={courierEmail}
                      onChange={(e) => setCourierEmail(e.target.value)}
                      placeholder="e.g. shipping@delhivery.com (optional)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Contact Person Name</label>
                    <input 
                      type="text"
                      value={courierContactPerson}
                      onChange={(e) => setCourierContactPerson(e.target.value)}
                      placeholder="Name of manager (optional)..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Contact Person No</label>
                    <input 
                      type="text"
                      value={courierContactPhone}
                      onChange={(e) => setCourierContactPhone(e.target.value)}
                      placeholder="Contact number of manager (optional)..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      {courierEditId ? 'Update Courier' : 'Add Partner'}
                    </button>
                    {courierEditId && (
                      <button
                        type="button"
                        onClick={resetCourierForm}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-3 rounded uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* List Table */}
                <div className="lg:col-span-7 space-y-4">
                  {courierPartners.length === 0 ? (
                    <div className="bg-slate-900/10 border border-dashed border-slate-800 py-12 text-center text-slate-500 text-xs italic rounded-lg">
                      No courier partners added yet. Register courier partners to choose them during shipping updates.
                    </div>
                  ) : (
                    <div className="bg-[#111827]/40 border border-slate-800 rounded-lg overflow-hidden shadow-md">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                              <th className="px-4 py-3 font-medium">Partner Details</th>
                              <th className="px-4 py-3 font-medium">Contact Person</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {courierPartners.map((partner) => (
                              <tr key={partner.id} className="hover:bg-slate-800/10 transition-colors">
                                <td className="px-4 py-3 space-y-0.5">
                                  <p className="font-semibold text-white">{partner.name}</p>
                                  {partner.phone && <p className="text-slate-450 text-[10px]">📞 {partner.phone}</p>}
                                  {partner.email && <p className="text-slate-450 text-[10px]">✉ {partner.email}</p>}
                                  {partner.address && <p className="text-slate-500 text-[10px] leading-tight line-clamp-2 max-w-xs">{partner.address}</p>}
                                </td>
                                <td className="px-4 py-3 space-y-0.5">
                                  {partner.contact_person ? (
                                    <>
                                      <p className="text-slate-200 font-medium">{partner.contact_person}</p>
                                      {partner.contact_phone && <p className="text-slate-450 text-[10px]">📞 {partner.contact_phone}</p>}
                                    </>
                                  ) : (
                                    <span className="text-slate-500 italic text-[10px]">Not specified</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditCourierClick(partner)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-850 px-2 py-1 rounded transition-colors text-[10px] font-semibold cursor-pointer border border-transparent hover:border-slate-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCourier(partner.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20 px-2 py-1 rounded transition-colors text-[10px] font-semibold cursor-pointer border border-transparent hover:border-red-900/30"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Tab: Store Logo Settings */}
          {activeTab === 'logo' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                <Sliders className="text-vedicana-green" size={16} />
                Store Brand Logo Management
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-5 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload transparent SVG or PNG logo file settings. The system automatically encodes and compresses it into high-speed WebP layout profiles.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Choose Image</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo || deletingLogo}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-2 text-xs text-slate-350 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  {uploadingLogo && (
                    <div className="flex items-center gap-2 text-xs text-vedicana-gold">
                      <Loader size={12} className="animate-spin" />
                      <span>WebP compression rendering...</span>
                    </div>
                  )}

                  {logoExists && (
                    <div className="space-y-4 pt-2">
                      <div className="border-t border-slate-800 pt-3">
                        <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-2">Adjust Height Dimensions</label>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-slate-500">Dimensions:</span>
                          <span className="text-white font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-750">{logoHeight}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="24" 
                          max="120" 
                          value={logoHeight}
                          onChange={(e) => setLogoHeight(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-vedicana-green mb-4"
                        />
                        <button
                          onClick={handleSaveLogoHeight}
                          disabled={saving}
                          className="w-full bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          Update Dimensions
                        </button>
                      </div>

                      <button
                        onClick={handleLogoDelete}
                        disabled={deletingLogo}
                        className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-red-900/20"
                      >
                        <Trash2 size={12} />
                        Delete Logo File
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Viewports */}
                <div className="lg:col-span-7 space-y-4 bg-slate-900/40 p-4 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye size={13} /> Active Preview Viewports
                  </h4>
                  
                  {!logoExists ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No custom logo uploaded. System falls back to styled brand text.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Header (Light Viewport)</span>
                        <div className="bg-white p-4 rounded border border-slate-200 flex items-center justify-center overflow-hidden" style={{ minHeight: '100px' }}>
                          <img 
                            src={`/logo.webp?t=${cacheBuster}`} 
                            alt="Logo Header Viewport" 
                            style={{ height: `${logoHeight}px` }}
                            className="max-w-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Footer (Dark Viewport)</span>
                        <div className="bg-black p-4 rounded border border-slate-950 flex items-center justify-center overflow-hidden" style={{ minHeight: '100px' }}>
                          <img 
                            src={`/logo.webp?t=${cacheBuster}`} 
                            alt="Logo Footer Viewport" 
                            style={{ height: `${logoHeight}px` }}
                            className="max-w-full object-contain invert brightness-0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Tab: Social Profiles */}
          {activeTab === 'social' && (
            <form onSubmit={handleSaveSocials} className="space-y-6 animate-fadeIn">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                <Globe className="text-vedicana-green" size={16} />
                Global Social Media Configurations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <FacebookIcon size={12} className="text-[#1877F2]" /> Facebook Page URL
                  </label>
                  <input 
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/vedicana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <InstagramIcon size={12} className="text-[#E4405F]" /> Instagram Page URL
                  </label>
                  <input 
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/vedicana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkedinIcon size={12} className="text-[#0A66C2]" /> LinkedIn Profile URL
                  </label>
                  <input 
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/vedicana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <YoutubeIcon size={12} className="text-[#FF0000]" /> YouTube Channel URL
                  </label>
                  <input 
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@vedicana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <TwitterIcon size={12} className="text-sky-400" /> Twitter / X URL
                  </label>
                  <input 
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/vedicana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <WhatsappIcon size={12} className="text-emerald-400" /> WhatsApp Number (For widget links)
                  </label>
                  <input 
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 9437272884"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
                Save Social Profiles
              </button>
            </form>
          )}

          {/* 4. Tab: Admin Access Settings */}
          {activeTab === 'admin' && (
            <form onSubmit={handleSaveAdminAccess} className="space-y-6 animate-fadeIn">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
                <Shield className="text-vedicana-green" size={16} />
                Administrator Login Credentials
              </h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Admin Email / Username</label>
                  <input 
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. admin@vedicana.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Change Admin Password</label>
                  <input 
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter new admin password"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Confirm Admin Password</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
                Update Admin Credentials
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
