import React, { useState, useRef } from 'react';
import { 
  UserPlus, Camera, Upload, CheckCircle2, FileText, ShieldCheck, 
  Trash2, Eye, Printer, AlertCircle, RefreshCw, Image as ImageIcon, X, Database, Edit2
} from 'lucide-react';
import { EmployeeForm, DocumentType, DocumentUpload, CompanySettings, PayrollRecord } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { MultiPagePrintPreview } from './MultiPagePrintPreview';
import { SearchableCompanySelect } from './SearchableCompanySelect';
import { calculatePayrollRow } from '../lib/calculations';
import { 
  saveEmployeeToFirestore, 
  savePayrollRecordToFirestore, 
  deleteEmployeeFromFirestore,
  deleteBatchEmployeesFromFirestore 
} from '../lib/firebase';

interface FormProps {
  employees: EmployeeForm[];
  setEmployees: React.Dispatch<React.SetStateAction<EmployeeForm[]>>;
  settings: CompanySettings;
  onOpenPreview?: (emp: EmployeeForm) => void;
  setPayrollRecords?: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  onOpenSqlImportModal?: () => void;
}

export const Form: React.FC<FormProps> = ({
  employees,
  setEmployees,
  settings,
  onOpenPreview,
  setPayrollRecords,
  onOpenSqlImportModal,
}) => {
  // Form State
  const [formData, setFormData] = useState<Partial<EmployeeForm>>({
    siteLocation: settings.companySite || 'WESTERN REFRIGERATION PVT LTD',
    cardNo: `${101 + employees.length}`,
    fullName: '',
    fatherName: '',
    fatherOrSpouseName: '',
    dob: '1995-01-01',
    gender: 'Male',
    category: 'Skilled',
    phone: '',
    email: '',
    presentAddress: '',
    permAddress: '',
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Assembly',
    designation: 'Staff',
    agt: 'PARISHRAM-01',
    uan: '',
    esicNo: '',
    accountNumber: '',
    ifscCode: '',
    bankName: 'HDFC Bank',
    baseRate: 9393,
    bonus: 0,
    hraRate: 344,
    totalComp: 9737,
    nomineeName: '',
    nomineePhone: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    documents: [],
  });

  // Selected Document Type for Camera Capture (Aadhaar, PAN, Profile Photo)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Aadhaar Card');
  
  // Camera Modal trigger
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Print Preview Modal trigger
  const [previewEmployee, setPreviewEmployee] = useState<EmployeeForm | null>(null);

  // Success Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile photo file input ref
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Saved forms bulk selection state
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [empSearch, setEmpSearch] = useState('');
  const [isBulkEmpModalOpen, setIsBulkEmpModalOpen] = useState(false);
  const [bulkSiteValue, setBulkSiteValue] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
    emp.cardNo.toLowerCase().includes(empSearch.toLowerCase()) ||
    (emp.siteLocation && emp.siteLocation.toLowerCase().includes(empSearch.toLowerCase()))
  );

  const isAllEmpsSelected = filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedEmpIds.includes(e.id));

  const handleToggleSelectAllEmps = () => {
    if (isAllEmpsSelected) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleToggleSelectEmp = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteEmps = () => {
    if (selectedEmpIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedEmpIds.length} selected employee worker form(s) from Cloud Firestore?`)) {
      const idsToDelete = [...selectedEmpIds];
      setEmployees((prev) => prev.filter((e) => !idsToDelete.includes(e.id)));
      setSelectedEmpIds([]);
      deleteBatchEmployeesFromFirestore(idsToDelete).catch(console.error);
      showToast(`Deleted ${idsToDelete.length} employee record(s) from database.`);
    }
  };

  const handleBulkSiteUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmpIds.length === 0 || !bulkSiteValue) return;

    const updatedEmps = employees.map((emp) => {
      if (selectedEmpIds.includes(emp.id)) {
        return { ...emp, siteLocation: bulkSiteValue };
      }
      return emp;
    });

    setEmployees(updatedEmps);
    const updatedSelected = updatedEmps.filter((e) => selectedEmpIds.includes(e.id));
    updatedSelected.forEach((emp) => saveEmployeeToFirestore(emp).catch(console.error));

    setIsBulkEmpModalOpen(false);
    setSelectedEmpIds([]);
    showToast(`Updated site location to "${bulkSiteValue}" for ${updatedSelected.length} employees.`);
  };

  // Compute total compensation automatically
  const computedTotal = (Number(formData.baseRate) || 0) + (Number(formData.bonus) || 0) + (Number(formData.hraRate) || 0);

  // Handle Profile Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
      showToast('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Camera Capture Complete
  const handleCameraCaptureComplete = (frontImage: string, backImage: string | null) => {
    if (selectedDocType === 'Profile Photo') {
      setFormData((prev) => ({ ...prev, photoUrl: frontImage }));
      showToast('Profile photo captured from camera successfully!');
      return;
    }

    const newDoc: DocumentUpload = {
      type: selectedDocType,
      frontImage,
      backImage,
      capturedAt: new Date().toLocaleString('en-IN'),
      documentNumber: `${selectedDocType === 'Aadhaar Card' ? 'XXXX XXXX ' + Math.floor(1000 + Math.random() * 9000) : 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F'}`,
    };

    setFormData((prev) => {
      const existingDocs = prev.documents || [];
      const filtered = existingDocs.filter((d) => d.type !== selectedDocType);
      return {
        ...prev,
        documents: [...filtered, newDoc],
      };
    });

    showToast(`Document (${selectedDocType}) captured & saved successfully!`);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      alert('Please fill in required details (Full Name & Contact Phone Number).');
      return;
    }

    const newEmp: EmployeeForm = {
      id: `emp_${Date.now()}`,
      cardNo: formData.cardNo || `${101 + employees.length}`,
      fullName: formData.fullName || '',
      fatherName: formData.fatherName || formData.fatherOrSpouseName || '',
      fatherOrSpouseName: formData.fatherName || formData.fatherOrSpouseName || '',
      dob: formData.dob || '',
      gender: formData.gender || 'Male',
      category: formData.category || 'Skilled',
      phone: formData.phone || '',
      email: formData.email || '',
      presentAddress: formData.presentAddress || formData.address || '',
      permAddress: formData.permAddress || formData.address || '',
      address: formData.presentAddress || formData.address || '',
      emergencyContact: formData.emergencyContact || formData.phone || '',
      bloodGroup: formData.bloodGroup || 'O+',
      joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
      department: formData.department || 'Assembly',
      designation: formData.designation || 'Staff',
      agt: formData.agt || 'PARISHRAM-01',
      uan: formData.uan || '',
      esicNo: formData.esicNo || '',
      accountNumber: formData.accountNumber || '',
      ifscCode: formData.ifscCode || '',
      bankName: formData.bankName || 'HDFC Bank',
      baseRate: Number(formData.baseRate || 0),
      bonus: Number(formData.bonus || 0),
      hraRate: Number(formData.hraRate || 0),
      totalComp: computedTotal,
      nomineeName: formData.nomineeName || '',
      nomineePhone: formData.nomineePhone || '',
      siteLocation: formData.siteLocation || settings.companySite || 'WESTERN REFRIGERATION PVT LTD',
      photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      documents: formData.documents || [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === newEmp.id);
      if (exists) {
        return prev.map((e) => (e.id === newEmp.id ? newEmp : e));
      }
      return [newEmp, ...prev];
    });
    saveEmployeeToFirestore(newEmp).catch(console.error);

    if (setPayrollRecords) {
      const newRecord = calculatePayrollRow({
        sn: employees.length + 1,
        cardNo: newEmp.cardNo,
        name: newEmp.fullName,
        days: 26,
        rate: newEmp.baseRate || 850,
        uan: newEmp.uan,
        esicNo: newEmp.esicNo,
        accountNumber: newEmp.accountNumber,
        ifscCode: newEmp.ifscCode,
        agt: newEmp.agt || 'PARISHRAM-01',
        clientCompany: newEmp.siteLocation || settings.companySite || 'WESTERN REFRIGERATION PVT LTD',
      });
      setPayrollRecords((prev) => {
        const pExists = prev.some((p) => p.cardNo === newEmp.cardNo);
        if (pExists) {
          return prev.map((p) => (p.cardNo === newEmp.cardNo ? { ...p, ...newRecord, id: p.id } : p));
        }
        return [newRecord, ...prev];
      });
      savePayrollRecordToFirestore(newRecord).catch(console.error);
    }

    showToast(`Employee "${newEmp.fullName}" saved to Cloud Firestore!`);

    // Open 2-Page Print preview immediately
    if (onOpenPreview) {
      onOpenPreview(newEmp);
    } else {
      setPreviewEmployee(newEmp);
    }

    // Reset Form
    setFormData({
      siteLocation: settings.companySite || 'WESTERN REFRIGERATION PVT LTD',
      cardNo: `${102 + employees.length}`,
      fullName: '',
      fatherName: '',
      fatherOrSpouseName: '',
      dob: '1995-01-01',
      gender: 'Male',
      category: 'Skilled',
      phone: '',
      email: '',
      presentAddress: '',
      permAddress: '',
      address: '',
      emergencyContact: '',
      bloodGroup: 'O+',
      joiningDate: new Date().toISOString().split('T')[0],
      department: 'Assembly',
      designation: 'Staff',
      agt: 'PARISHRAM-01',
      uan: '',
      esicNo: '',
      accountNumber: '',
      ifscCode: '',
      bankName: 'HDFC Bank',
      baseRate: 0,
      bonus: 0,
      hraRate: 0,
      totalComp: 0,
      nomineeName: '',
      nomineePhone: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      documents: [],
    });
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee record?')) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      deleteEmployeeFromFirestore(id).catch(console.error);
      showToast('Employee record deleted from cloud database.');
    }
  };

  const handleEditEmployee = (emp: EmployeeForm) => {
    setFormData(emp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded ${emp.fullName} for editing.`);
  };

  return (
    <div className="space-y-8 animate-fadeIn print:hidden">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Parishram Enterprises - Employment Application Form
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SITE: {settings.companySite || 'WESTERN REFRIGERATION PVT LTD'} • Fill in complete worker details, upload or snap profile photo, capture document attachments, and print 2-page forms.
          </p>
        </div>

        {onOpenSqlImportModal && (
          <button
            onClick={onOpenSqlImportModal}
            id="btn-form-import-sql"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
          >
            <Database className="w-4 h-4 text-indigo-200" />
            Import SQL File
          </button>
        )}

        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {toastMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Onboarding Form matching requested format */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  PARISHRAM ENTERPRISES
                </h3>
                <p className="text-[10px] text-slate-400">Manpower Supply & Labour Contractor</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold bg-blue-600 px-2.5 py-1 rounded">
                CARD NO: {formData.cardNo}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
            
            {/* Top Row: Company / Site & Profile Photo Upload / Camera */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full text-xs">
                <label className="block font-bold text-slate-800 uppercase mb-1">WORKING CONTRACT COMPANY / SITE *</label>
                <SearchableCompanySelect
                  companies={settings.clientCompanies || ['WESTERN REFRIGERATION PVT LTD', 'STERLING GENERATORS PVT LTD', 'ALKEM LABORATORIES']}
                  value={formData.siteLocation || ''}
                  onChange={(val) => setFormData({ ...formData, siteLocation: val })}
                  placeholder="Search or select client company..."
                />
              </div>

              {/* Profile Photo Display & Upload / Snap Buttons */}
              <div className="flex items-center gap-3 shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-16 h-20 border border-slate-300 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-400 font-bold uppercase text-center p-1">No Photo</span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="block font-bold text-slate-800 text-[11px] uppercase">PROFILE PHOTO</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer border border-slate-300"
                    >
                      <Upload className="w-3 h-3 text-blue-600" />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocType('Profile Photo');
                        setIsCameraModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Camera className="w-3 h-3" />
                      Camera
                    </button>
                  </div>
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            </div>

            {/* Grid 1: Personnel Information */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Basic Worker Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Worker full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">FATHER NAME</label>
                  <input
                    type="text"
                    placeholder="Father name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">DOB (Date of Birth)</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GENDER</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CATEGORY</label>
                  <input
                    type="text"
                    placeholder="e.g. TEST, Skilled, Unskilled"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    placeholder="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">AADHAR NO</label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar Number"
                    value={formData.esicNo}
                    onChange={(e) => setFormData({ ...formData, esicNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">PRESENT ADDRESS</label>
                  <input
                    type="text"
                    placeholder="e.g. UMBERGAON GIDC KK SILK MILLS UNIT 3"
                    value={formData.presentAddress}
                    onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">PERMANENT ADDRESS</label>
                  <input
                    type="text"
                    placeholder="e.g. Takshashila C Wing 404"
                    value={formData.permAddress}
                    onChange={(e) => setFormData({ ...formData, permAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Compensation Rates (RATE, BONUS, HRA, TOTAL) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Compensation Structure (Rate, Bonus, HRA & Total)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RATE (₹)</label>
                  <input
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">BONUS (₹)</label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">HRA (₹)</label>
                  <input
                    type="number"
                    value={formData.hraRate}
                    onChange={(e) => setFormData({ ...formData, hraRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">TOTAL (₹)</label>
                  <div className="w-full p-2.5 bg-blue-50 border border-blue-300 text-blue-900 font-mono font-black rounded-xl text-sm">
                    ₹{computedTotal}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 3: Employment Details, Statutory & Bank Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Joining, Contact, Banking & Nominee Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">JOINING DATE</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CARD NO</label>
                  <input
                    type="text"
                    required
                    value={formData.cardNo}
                    onChange={(e) => setFormData({ ...formData, cardNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">UAN NO</label>
                  <input
                    type="text"
                    placeholder="12-digit UAN"
                    value={formData.uan}
                    onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CONTACT NO *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ACCOUNT NO</label>
                  <input
                    type="text"
                    placeholder="Bank Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC CODE</label>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NOMINEE NAME</label>
                  <input
                    type="text"
                    placeholder="Nominee Name"
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NOMINEE PHONE</label>
                  <input
                    type="tel"
                    placeholder="Nominee Contact Number"
                    value={formData.nomineePhone}
                    onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Document Verification & Camera Attachment */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Document Attachment (Aadhaar / PAN Card)
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Select document type and open camera to take Front and Back side photos for Page 2 of the form.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                {/* Document Selector */}
                <div className="w-full sm:w-auto">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('Aadhaar Card')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedDocType === 'Aadhaar Card'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Aadhaar Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('PAN Card')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedDocType === 'PAN Card'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      PAN Card
                    </button>
                  </div>
                </div>

                {/* Open Camera Button */}
                <div className="w-full sm:w-auto self-end">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    id="btn-open-camera-modal"
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera to Capture {selectedDocType}
                  </button>
                </div>
              </div>

              {/* Uploaded Documents Thumbnails */}
              {formData.documents && formData.documents.length > 0 ? (
                <div className="space-y-3 mt-4 pt-3 border-t border-slate-200">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Document Attachment Ready for Page 2!
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="bg-white border border-slate-300 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">{doc.type}</span>
                          <span className="text-[10px] text-slate-400">{doc.capturedAt}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {doc.frontImage && (
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Front Side</span>
                              <img src={doc.frontImage} alt="Front" className="w-full h-24 object-cover rounded border border-slate-200" />
                            </div>
                          )}
                          {doc.backImage && (
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Back Side</span>
                              <img src={doc.backImage} alt="Back" className="w-full h-24 object-cover rounded border border-slate-200" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/60 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No document attached yet. Click "Open Camera" to capture front & back side images.
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Saving will create worker entry and generate the 2-page application form automatically.
              </span>
              <button
                type="submit"
                id="btn-submit-employee-form"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Application & Open 2-Page Form
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Saved Employees List with Bulk Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Saved Forms ({employees.length})
              </h3>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300">
                  <input
                    type="checkbox"
                    checked={isAllEmpsSelected}
                    onChange={handleToggleSelectAllEmps}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Select All</span>
                </label>
              </div>
            </div>

            {/* Employee Search Bar */}
            <div className="mb-3">
              <input
                type="text"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Search saved forms by name, card no, or site..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bulk Action Toolbar */}
            {selectedEmpIds.length > 0 && (
              <div className="mb-3 p-2.5 bg-indigo-950 text-white rounded-xl shadow border border-indigo-800 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-200">
                  {selectedEmpIds.length} Selected
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBulkSiteValue('');
                      setIsBulkEmpModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Change Site
                  </button>
                  <button
                    onClick={handleBulkDeleteEmps}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Delete ({selectedEmpIds.length})
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredEmployees.map((emp) => {
                const hasDocs = emp.documents.length > 0;
                const isSelected = selectedEmpIds.includes(emp.id);
                return (
                  <div 
                    key={emp.id} 
                    className={`p-3 border rounded-xl space-y-2 transition-all ${
                      isSelected ? 'bg-indigo-50/80 border-indigo-400 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectEmp(emp.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{emp.fullName}</h4>
                          <span className="text-[10px] text-slate-500 font-mono block truncate">Card No: {emp.cardNo} • {emp.department}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onOpenPreview ? onOpenPreview(emp) : setPreviewEmployee(emp)}
                          id={`btn-view-doc-${emp.cardNo}`}
                          title="View & Print Application Form"
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-500 cursor-pointer shadow"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditEmployee(emp)}
                          title="Edit Employee Details"
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          title="Delete Employee"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/80">
                      <span className="text-slate-500 font-medium truncate max-w-[130px]">Site: {emp.siteLocation || 'Default'}</span>
                      {hasDocs ? (
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          {emp.documents[0].type}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium bg-slate-200/80 px-2 py-0.5 rounded">
                          Form Only
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          documentType={selectedDocType}
          onCaptureComplete={handleCameraCaptureComplete}
          onClose={() => setIsCameraModalOpen(false)}
        />
      )}

      {/* 2-Page Print Preview Modal */}
      {previewEmployee && (
        <MultiPagePrintPreview
          employee={previewEmployee}
          settings={settings}
          onClose={() => setPreviewEmployee(null)}
        />
      )}

      {/* Bulk Site Location Update Modal */}
      {isBulkEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Update Site ({selectedEmpIds.length} Selected)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkEmpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSiteUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Site / Company Location</label>
                <SearchableCompanySelect
                  value={bulkSiteValue}
                  onChange={(val) => setBulkSiteValue(val)}
                  companies={settings.clientCompanies || []}
                  placeholder="Select or enter site name..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBulkEmpModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Apply Site Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
