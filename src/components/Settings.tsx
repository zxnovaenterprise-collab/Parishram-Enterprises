import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, Building2, Save, RotateCcw, Download, Upload, 
  CheckCircle2, Plus, Trash2, Image as ImageIcon, Users, Key, Lock, ShieldCheck, 
  X, Check, Sparkles, Building, Database, HardDrive, Cpu, Cloud, RefreshCw, Zap, Server
} from 'lucide-react';
import { CompanySettings, EmployeeForm, PayrollRecord, PortalUser, ActiveTab } from '../types';
import { 
  saveSettingsToFirestore, 
  pingFirestore, 
  saveBatchEmployeesToFirestore, 
  saveBatchPayrollRecordsToFirestore 
} from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsProps {
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  employees: EmployeeForm[];
  setEmployees: React.Dispatch<React.SetStateAction<EmployeeForm[]>>;
  payrollRecords: PayrollRecord[];
  setPayrollRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  onResetData: () => void;
  users: PortalUser[];
  setUsers: React.Dispatch<React.SetStateAction<PortalUser[]>>;
  onOpenSqlImportModal?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  setSettings,
  employees,
  setEmployees,
  payrollRecords,
  setPayrollRecords,
  onResetData,
  users,
  setUsers,
  onOpenSqlImportModal,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    clientCompanies: settings.clientCompanies || [
      'WESTERN REFRIGERATION PVT LTD',
      'STERLING GENERATORS PVT LTD',
      'ALKEM LABORATORIES LTD',
      'TATA STEEL BSL LTD',
      'AMNEAL PHARMACEUTICALS',
      'SUN PHARMA INDUSTRIES',
    ],
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Firebase Cloud Diagnostics State
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const handlePingFirebase = async () => {
    setIsPinging(true);
    try {
      const ms = await pingFirestore();
      setPingLatency(ms);
      setSyncStatusMsg(`Firebase Cloud Firestore Ping: ${ms}ms latency.`);
    } catch (err: any) {
      setSyncStatusMsg(`Firebase Ping Error: ${err.message || err}`);
    } finally {
      setIsPinging(false);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  const handleForceSyncAll = async () => {
    setIsSyncing(true);
    try {
      if (employees.length > 0) {
        await saveBatchEmployeesToFirestore(employees);
      }
      if (payrollRecords.length > 0) {
        await saveBatchPayrollRecordsToFirestore(payrollRecords);
      }
      await saveSettingsToFirestore(formData);
      setSyncStatusMsg(`Successfully synchronized ${employees.length} employee documents, ${payrollRecords.length} payroll records, and settings to Firestore!`);
    } catch (err: any) {
      setSyncStatusMsg(`Sync Error: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  // Logo file upload ref
  const logoFileRef = useRef<HTMLInputElement>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('Staff');
  const [newAllowedTabs, setNewAllowedTabs] = useState<ActiveTab[]>([
    'dashboard',
    'payroll',
    'form',
    'idcard',
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    saveSettingsToFirestore(formData).catch(console.error);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData((prev) => ({ ...prev, companyLogo: evt.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new Client Company
  const handleAddCompany = () => {
    const cleanName = newCompanyName.trim().toUpperCase();
    if (!cleanName) return;

    if (!formData.clientCompanies.includes(cleanName)) {
      const updated = [...formData.clientCompanies, cleanName];
      setFormData((prev) => ({ ...prev, clientCompanies: updated }));
      setSettings((prev) => ({ ...prev, clientCompanies: updated }));
    }
    setNewCompanyName('');
  };

  // Remove Client Company
  const handleRemoveCompany = (compName: string) => {
    const updated = formData.clientCompanies.filter((c) => c !== compName);
    setFormData((prev) => ({ ...prev, clientCompanies: updated }));
    setSettings((prev) => ({ ...prev, clientCompanies: updated }));
  };

  // Add New Portal User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newFullName) return;

    const newUser: PortalUser = {
      id: `usr_${Date.now()}`,
      username: newUsername.trim(),
      password: newPassword.trim(),
      fullName: newFullName.trim(),
      role: newRole.trim() || 'Portal User',
      allowedTabs: newAllowedTabs,
    };

    setUsers((prev) => [...prev, newUser]);

    // Reset User form
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewRole('Staff');
    setNewAllowedTabs(['dashboard', 'payroll', 'form', 'idcard']);
  };

  // Toggle tab checkbox
  const toggleTabPermission = (tab: ActiveTab) => {
    if (newAllowedTabs.includes(tab)) {
      if (newAllowedTabs.length === 1) return; // keep at least 1 tab
      setNewAllowedTabs((prev) => prev.filter((t) => t !== tab));
    } else {
      setNewAllowedTabs((prev) => [...prev, tab]);
    }
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('System requires at least one admin account.');
      return;
    }
    if (confirm('Delete this user login account?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // Export full app database as JSON
  const handleExportDatabase = () => {
    const fullState = {
      settings: formData,
      employees,
      payrollRecords,
      users,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Import full app database JSON
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.settings) setSettings(data.settings);
        if (data.employees) setEmployees(data.employees);
        if (data.payrollRecords) setPayrollRecords(data.payrollRecords);
        if (data.users) setUsers(data.users);

        alert('Database restored successfully from backup!');
      } catch (err) {
        alert('Invalid database JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const allTabsList: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'payroll', label: 'Payroll & Slips' },
    { id: 'form', label: 'Worker Form & Docs' },
    { id: 'idcard', label: 'ID Cards' },
    { id: 'settings', label: 'Settings & Users' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto print:hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            System, Branding & User Access Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload agency logo, manage contract companies list, assign user credentials, and set tab access rights.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            Settings Saved!
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-8">
        
        {/* SECTION 1: Company Logo Upload */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Agency Official Logo (Appears on Portal, Slips & Forms)
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
              {formData.companyLogo ? (
                <img src={formData.companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-[9px] font-bold block">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Upload Agency Logo Graphic</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                PNG or JPEG recommended (300x300px). This logo will appear at the top of the main portal header,
                printed salary slips, employment application forms, and worker ID cards.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Select Image File
                </button>

                {formData.companyLogo && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, companyLogo: '' }))}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Logo
                  </button>
                )}

                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Company Header & Contact Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Agency Name & Contact Header
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Main Agency Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Phone</label>
              <input
                type="text"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Full Registered Address</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.companyGst}
                onChange={(e) => setFormData({ ...formData, companyGst: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Signatory Title</label>
              <input
                type="text"
                value={formData.signatoryDesignation}
                onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Contracting / Client Companies List */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Contracted Client Companies / Work Sites
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Parishram Enterprises provides labor to multiple client companies. Add company names here so they auto-appear in all dropdown search boxes.
          </p>

          <div className="space-y-4">
            {/* Add New Company Box */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter client company name (e.g. TATA STEEL, ALKEM LABS)..."
                className="flex-1 bg-white px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCompany}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>

            {/* List of Client Companies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {formData.clientCompanies.map((comp) => (
                <div
                  key={comp}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-sm hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-800 uppercase truncate">{comp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompany(comp)}
                    title="Delete Company"
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Statutory Defaults */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Statutory Percentage Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PF Employee Rate (%)</label>
              <input
                type="number"
                value={formData.pfRatePercent}
                onChange={(e) => setFormData({ ...formData, pfRatePercent: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ESIC Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.esicRatePercent}
                onChange={(e) => setFormData({ ...formData, esicRatePercent: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Days / Month</label>
              <input
                type="number"
                value={formData.standardMonthDays}
                onChange={(e) => setFormData({ ...formData, standardMonthDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            id="btn-save-settings"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>

      {/* SECTION 5: User Credentials & Tab Access Control */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            User Login Credentials & Tab Access Control
          </h3>
          <p className="text-xs text-slate-500">
            Create user accounts with custom User IDs and Passwords, and grant access ONLY to specific tabs.
          </p>
        </div>

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" />
            Create New User Account
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">User ID / Username</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. hr_ramesh"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set password"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. HR Executive"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2 text-xs">
              Permitted Tab Access Rights (Check tabs user can access):
            </label>
            <div className="flex flex-wrap gap-2">
              {allTabsList.map((tab) => {
                const isChecked = newAllowedTabs.includes(tab.id);
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => toggleTabPermission(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Create User Account
            </button>
          </div>
        </form>

        {/* Existing Users List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Portal Users ({users.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{u.fullName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {u.role}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-mono flex items-center gap-3">
                    <span>User ID: <strong className="text-blue-700">{u.username}</strong></span>
                    <span>Pass: <strong>{u.password}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {u.allowedTabs.map((tab) => (
                      <span key={tab} className="text-[9px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                        {tab}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteUser(u.id)}
                  title="Delete User Account"
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Firebase Cloud Connection & Storage Usage Panel */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Firebase Cloud Storage & Real-time Database</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Connected & Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Cloud Firestore document database & authentication integration active with real-time websocket sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePingFirebase}
              disabled={isPinging}
              id="btn-ping-firebase"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Zap className={`w-4 h-4 text-amber-400 ${isPinging ? 'animate-bounce' : ''}`} />
              {isPinging ? 'Pinging Cloud...' : 'Test Cloud Connection'}
            </button>

            <button
              onClick={handleForceSyncAll}
              disabled={isSyncing}
              id="btn-sync-firebase"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All Data to Firestore'}
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="p-3 bg-blue-950/90 border border-blue-500/40 rounded-xl text-blue-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Live Storage Usage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Storage Stat 1 */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-400" /> Employees Store</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Firestore</span>
            </div>
            <div className="text-xl font-black text-white font-mono">{employees.length} Docs</div>
            <p className="text-[10px] text-slate-400 mt-1">Est. Size: ~{(employees.length * 0.45).toFixed(2)} KB</p>
          </div>

          {/* Storage Stat 2 */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-400" /> Payroll Records</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Firestore</span>
            </div>
            <div className="text-xl font-black text-white font-mono">{payrollRecords.length} Docs</div>
            <p className="text-[10px] text-slate-400 mt-1">Est. Size: ~{(payrollRecords.length * 0.85).toFixed(2)} KB</p>
          </div>

          {/* Storage Stat 3 */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-indigo-400" /> Total Storage Used</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">Calculated</span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              ~{((employees.length * 0.45) + (payrollRecords.length * 0.85) + 0.85).toFixed(2)} KB
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Capacity: Unlimited Firestore Cloud</p>
          </div>

          {/* Storage Stat 4 */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-amber-400" /> Latency & Status</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Live</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {pingLatency !== null ? `${pingLatency} ms` : 'Active'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">CRUD: Add, Edit, Delete Sync Enabled</p>
          </div>
        </div>

        {/* Configuration Summary Table */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Firebase Project Credentials & Environment Parameters
            </span>
            <span className="text-[10px] text-slate-500 font-mono">firebase-applet-config.json</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 font-mono text-[11px] pt-1">
            <div>
              <span className="text-slate-500 block">Firebase Project ID:</span>
              <strong className="text-slate-200">{firebaseConfig.projectId || 'gen-lang-client-0393236150'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Firestore Database ID:</span>
              <strong className="text-slate-200">{firebaseConfig.firestoreDatabaseId || 'ai-studio-payrollworkforce-df125ddd-cda9-4e15-a2e0-a85a4eba3ab8'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Auth Domain:</span>
              <strong className="text-slate-200">{firebaseConfig.authDomain || 'Connected'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Storage Bucket:</span>
              <strong className="text-slate-200">{firebaseConfig.storageBucket || 'Configured'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Database Backup & Reset Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Database Backup, Restore & Reset
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenSqlImportModal && (
            <button
              onClick={onOpenSqlImportModal}
              id="btn-settings-import-sql"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Database className="w-4 h-4 text-blue-200" />
              Import SQL Dump File
            </button>
          )}

          <button
            onClick={handleExportDatabase}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Backup Full Database (JSON)
          </button>

          <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow">
            <Upload className="w-4 h-4" />
            Restore Database JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportDatabase}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Sample Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
