import React, { useState } from 'react';
import { Settings as SettingsIcon, Building2, Save, RotateCcw, Download, Upload, CheckCircle2 } from 'lucide-react';
import { CompanySettings, EmployeeForm, PayrollRecord } from '../types';

interface SettingsProps {
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  employees: EmployeeForm[];
  setEmployees: React.Dispatch<React.SetStateAction<EmployeeForm[]>>;
  payrollRecords: PayrollRecord[];
  setPayrollRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  setSettings,
  employees,
  setEmployees,
  payrollRecords,
  setPayrollRecords,
  onResetData,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Export full app database as JSON
  const handleExportDatabase = () => {
    const fullState = {
      settings: formData,
      employees,
      payrollRecords,
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

        alert('Database restored successfully from backup!');
      } catch (err) {
        alert('Invalid database JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Company & System Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure company branding for payslips, default statutory rates, and system backup/restore.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            Settings Saved!
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Company Identification & Header Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
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
              <label className="block font-semibold text-slate-700 mb-1">Full Company Address</label>
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

        {/* Statutory Defaults */}
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

      {/* Database Backup & Reset Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Database Backup, Restore & Reset
        </h3>

        <div className="flex flex-wrap items-center gap-3">
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
