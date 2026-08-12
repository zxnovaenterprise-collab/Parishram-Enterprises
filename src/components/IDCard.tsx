import React, { useState } from 'react';
import { IdCard, Printer, Search, Building2, Check, ShieldCheck, QrCode } from 'lucide-react';
import { EmployeeForm, CompanySettings } from '../types';

interface IDCardProps {
  employees: EmployeeForm[];
  settings: CompanySettings;
}

export const IDCard: React.FC<IDCardProps> = ({ employees, settings }) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <IdCard className="w-6 h-6 text-blue-600" />
            Official Staff Identification Cards
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standard ISO ID card dimensions with high-contrast company branding, barcode, employee photo, and emergency details.
          </p>
        </div>

        <button
          onClick={handlePrint}
          id="btn-print-id-cards"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print ID Card (Front & Back)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        {/* Left Column: Employee Selector */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 print:hidden">
          <h3 className="font-bold text-sm text-slate-900">Select Employee</h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {employees
              .filter(
                (e) =>
                  e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  e.cardNo.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((emp) => {
                const isSelected = emp.id === selectedEmp?.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={emp.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate">{emp.fullName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{emp.cardNo} • {emp.department}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right 2 Cols: ID Card Preview (Front & Back) */}
        <div className="lg:col-span-2 bg-slate-100 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center gap-8 print:p-0 print:bg-white print:border-none">
          {selectedEmp ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 print:gap-12" id="printable-id-card">
              
              {/* FRONT OF ID CARD */}
              <div className="w-[320px] h-[500px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-slate-800">
                {/* Top Banner Header */}
                <div className="bg-slate-900 text-white p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold tracking-wider uppercase">{settings.companyName || 'Apex Engineering'}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">OFFICIAL IDENTIFICATION CARD</p>
                </div>

                {/* Photo & Main Details */}
                <div className="p-6 flex flex-col items-center text-center space-y-3 flex-1 justify-center">
                  <div className="relative">
                    <img
                      src={selectedEmp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={selectedEmp.fullName}
                      className="w-24 h-28 object-cover rounded-xl border-2 border-slate-900 shadow-md"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border border-white shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedEmp.fullName}</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{selectedEmp.designation}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 w-full grid grid-cols-2 gap-1 text-[11px]">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">CARD NO</span>
                      <span className="font-bold text-slate-800 font-mono">{selectedEmp.cardNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">DEPT</span>
                      <span className="font-semibold text-slate-800">{selectedEmp.department}</span>
                    </div>
                    <div className="text-left mt-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">BLOOD GROUP</span>
                      <span className="font-bold text-rose-600">{selectedEmp.bloodGroup || 'O+'}</span>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">JOINED</span>
                      <span className="font-semibold text-slate-800">{selectedEmp.joiningDate}</span>
                    </div>
                  </div>
                </div>

                {/* Barcode Strip */}
                <div className="bg-slate-900 text-white p-3 text-center flex flex-col items-center justify-center">
                  <div className="font-mono text-xs tracking-widest bg-white text-black px-4 py-1 rounded font-bold">
                    ||| | |||| | ||| || {selectedEmp.cardNo}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1">Property of {settings.companyName}</span>
                </div>
              </div>

              {/* BACK OF ID CARD */}
              <div className="w-[320px] h-[500px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-slate-800">
                <div className="bg-slate-900 text-white p-3 text-center">
                  <h4 className="text-xs font-bold tracking-wider uppercase">INSTRUCTIONS & TERMS</h4>
                </div>

                <div className="p-6 text-xs text-slate-600 space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Residential Address</span>
                    <p className="font-medium text-slate-800 text-[11px] leading-relaxed mt-0.5">
                      {selectedEmp.address || settings.companyAddress}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                    <p className="font-semibold text-slate-900 text-[11px] mt-0.5">{selectedEmp.emergencyContact || selectedEmp.phone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Statutory Registration</span>
                    <p className="font-mono text-[10px] text-slate-700">UAN: {selectedEmp.uan || 'N/A'}</p>
                    <p className="font-mono text-[10px] text-slate-700">ESIC: {selectedEmp.esicNo || 'N/A'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-center">
                    <p className="text-[9px] text-slate-400 leading-tight">
                      This card is non-transferable. If found, please return to: {settings.companyAddress}
                    </p>
                  </div>
                </div>

                {/* Authorized Stamp */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <QrCode className="w-6 h-6 text-slate-800" />
                    <span>SCAN VERIFY</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">AUTHORIZED SIGNATURE</span>
                    <span className="text-[10px] font-bold text-slate-800">{settings.signatoryName || 'HR Head'}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-slate-400 text-xs text-center p-8">No employee selected</div>
          )}
        </div>
      </div>
    </div>
  );
};
