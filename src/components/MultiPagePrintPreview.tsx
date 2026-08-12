import React from 'react';
import { Printer, X, ShieldCheck, CreditCard, FileCheck2, UserCheck } from 'lucide-react';
import { EmployeeForm, CompanySettings } from '../types';

interface MultiPagePrintPreviewProps {
  employee: EmployeeForm;
  settings: CompanySettings;
  onClose: () => void;
}

export const MultiPagePrintPreview: React.FC<MultiPagePrintPreviewProps> = ({
  employee,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Find primary document (Aadhaar or PAN)
  const primaryDoc = employee.documents.find(d => d.type === 'Aadhaar Card') || employee.documents[0];

  // Calculate total compensation
  const computedTotal = (employee.baseRate || 0) + (employee.bonus || 0) + (employee.hraRate || 0);

  const displaySite = employee.siteLocation || settings.companySite || 'WESTERN REFRIGERATION PVT LTD';
  const displayCompany = settings.companyName || 'PARISHRAM ENTERPRISES';
  const displaySubTitle = settings.companySubTitle || 'Manpower Supply & Labour Contractor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Action Header bar (hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Official Application Form & Worker Document Record (2 Pages)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-employee-record"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF (Both Pages)
            </button>
            <button
              onClick={onClose}
              id="btn-close-employee-doc"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Print Document Body */}
        <div className="p-8 font-sans text-slate-900 print:p-0 bg-white" id="printable-employee-doc">
          
          {/* ================= PAGE 1: EMPLOYMENT APPLICATION FORM (EXACT MATCHING SCREENSHOT) ================= */}
          <div className="print-page-1 min-h-[960px] flex flex-col justify-between border-b-2 border-slate-300 pb-8 mb-8 print:border-none print:mb-0 print:pb-0 print:min-h-0">
            <div>
              {/* Header Layout */}
              <div className="flex items-start justify-between gap-4 mb-3 border-b-2 border-slate-900 pb-4">
                {/* Left: Logo & Company Name */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center font-black border-2 border-slate-900 shrink-0 shadow-sm">
                    <span className="text-xl tracking-tighter font-serif text-amber-400">PE</span>
                    <span className="text-[8px] font-sans tracking-widest text-slate-300">ESTD</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                      {displayCompany}
                    </h1>
                    <p className="text-xs font-bold text-slate-700">
                      {displaySubTitle}
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mt-1">
                      SITE: {displaySite}
                    </p>
                  </div>
                </div>

                {/* Top Right Profile Photo Box */}
                <div className="w-28 h-32 border-2 border-slate-900 rounded bg-slate-50 flex flex-col items-center justify-center p-1 text-center shrink-0 overflow-hidden relative shadow-sm">
                  {employee.photoUrl ? (
                    <img src={employee.photoUrl} alt="Employee Photo" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                      <span className="text-[9px] font-bold uppercase text-slate-500">Profile Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Badge & Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="border-2 border-slate-900 px-6 py-1.5 rounded-sm font-black text-sm tracking-wider uppercase text-slate-900 shadow-sm">
                  EMPLOYMENT APPLICATION FORM
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono">
                  Date: {employee.createdAt || new Date().toLocaleDateString('en-US')}
                </div>
              </div>

              {/* Boxed Grid Layout matching provided reference */}
              <div className="border-2 border-slate-900 divide-y-2 divide-slate-900 text-xs text-slate-900 font-medium">
                
                {/* Row 1: Company / Site */}
                <div className="p-2.5 bg-slate-50/50">
                  <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">COMPANY / SITE:</span>
                  <p className="font-extrabold text-sm uppercase text-slate-900">{displaySite}</p>
                </div>

                {/* Row 2: Name | Father Name */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">NAME:</span>
                    <p className="font-extrabold text-xs uppercase text-slate-900">{employee.fullName || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">FATHER NAME:</span>
                    <p className="font-extrabold text-xs uppercase text-slate-900">{employee.fatherName || employee.fatherOrSpouseName || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 3: DOB | Gender */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">DOB:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.dob || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">GENDER:</span>
                    <p className="font-bold text-xs text-slate-900">{employee.gender || 'Male'}</p>
                  </div>
                </div>

                {/* Row 4: Category | Department */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">CATEGORY:</span>
                    <p className="font-bold text-xs text-slate-900 uppercase">{employee.category || 'Skilled'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">DEPARTMENT:</span>
                    <p className="font-bold text-xs text-slate-900 uppercase">{employee.department || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 5: Aadhar No */}
                <div className="p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">AADHAR NO:</span>
                  <p className="font-extrabold text-xs text-slate-900 font-mono tracking-wider">{employee.esicNo || employee.documents.find(d => d.type === 'Aadhaar Card')?.documentNumber || '886365497514'}</p>
                </div>

                {/* Row 6: Present Address */}
                <div className="p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">PRESENT ADDR:</span>
                  <p className="font-bold text-xs uppercase text-slate-900">{employee.presentAddress || employee.address || 'N/A'}</p>
                </div>

                {/* Row 7: Permanent Address */}
                <div className="p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">PERM ADDR:</span>
                  <p className="font-bold text-xs uppercase text-slate-900">{employee.permAddress || employee.address || 'N/A'}</p>
                </div>

                {/* Row 8: Rate | Bonus | HRA | Total */}
                <div className="grid grid-cols-4 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">RATE:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">{employee.baseRate || 0}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">BONUS:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">{employee.bonus || 0}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">HRA:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">{employee.hraRate || 0}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">TOTAL:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">{employee.totalComp || computedTotal}</p>
                  </div>
                </div>

                {/* Row 9: Joining Date | Card No */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">JOINING DATE:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.joiningDate || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">CARD NO:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">{employee.cardNo || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 10: UAN No | Contact No */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">UAN NO:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.uan || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">CONTACT NO:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 11: Account No | IFSC Code */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">ACCOUNT NO:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.accountNumber || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">IFSC CODE:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono uppercase">{employee.ifscCode || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 12: Nominee Name | Nominee Phone */}
                <div className="grid grid-cols-2 divide-x-2 divide-slate-900">
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">NOMINEE NAME:</span>
                    <p className="font-bold text-xs text-slate-900 uppercase">{employee.nomineeName || 'N/A'}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">NOMINEE PHONE:</span>
                    <p className="font-bold text-xs text-slate-900 font-mono">{employee.nomineePhone || 'N/A'}</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Signature Lines */}
            <div className="pt-16 grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-900">
              <div>
                <div className="border-t-2 border-slate-900 pt-2 tracking-wider">
                  HR SIGN
                </div>
              </div>
              <div>
                <div className="border-t-2 border-slate-900 pt-2 tracking-wider">
                  CONTRACTOR SIGN
                </div>
              </div>
              <div>
                <div className="border-t-2 border-slate-900 pt-2 tracking-wider">
                  EMPLOYEE SIGN
                </div>
              </div>
            </div>

          </div>

          {/* ================= PAGE 2: ID CARD (FRONT & BACKSIDE) AND ATTACHED DOCUMENTS ================= */}
          <div className="print-page-2 min-h-[960px] flex flex-col justify-between pt-4 print:pt-0 print:min-h-0">
            <div>
              {/* Page 2 Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">{displayCompany}</h1>
                  <p className="text-xs text-slate-700 font-bold">
                    WORKER ID CARD (FRONT & BACKSIDE) & ATTACHED DOCUMENTS | Page 2 of 2
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-400 px-3 py-1 rounded text-slate-900">
                    CARD NO: {employee.cardNo}
                  </span>
                </div>
              </div>

              {/* ---------------- SECTION 1: WORKER ID CARD (FRONT & BACKSIDE) ---------------- */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-1 border-b border-slate-300">
                  <CreditCard className="w-5 h-5 text-blue-700" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                    1. OFFICIAL WORKER IDENTIFICATION CARD (FRONT & BACKSIDE)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                  
                  {/* === ID CARD - FRONT SIDE === */}
                  <div className="w-[340px] h-[220px] bg-white border-2 border-slate-900 rounded-xl overflow-hidden shadow-md flex flex-col justify-between relative print:shadow-none">
                    {/* Top Company Bar */}
                    <div className="bg-slate-900 text-white p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-black tracking-wider text-amber-400 uppercase">{displayCompany}</span>
                      </div>
                      <p className="text-[9px] text-slate-300 font-semibold uppercase tracking-tight leading-none mt-0.5">
                        {displaySubTitle}
                      </p>
                      <p className="text-[8px] text-amber-300 font-black uppercase mt-0.5 tracking-wider">
                        SITE: {displaySite}
                      </p>
                    </div>

                    {/* Middle Details & Photo */}
                    <div className="p-3 flex gap-3 items-center flex-1">
                      {/* Photo */}
                      <div className="w-20 h-24 border-2 border-slate-900 rounded bg-slate-100 overflow-hidden shrink-0 shadow-sm">
                        {employee.photoUrl ? (
                          <img src={employee.photoUrl} alt="ID Photo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400 font-bold">PHOTO</div>
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="flex-1 text-[11px] space-y-1 text-slate-900">
                        <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase block leading-none">NAME</span>
                          <span className="font-black text-xs uppercase text-slate-900 block leading-tight">{employee.fullName || 'TEST'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-0.5">
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">CARD NO</span>
                            <span className="font-extrabold text-xs text-blue-700 font-mono leading-tight">{employee.cardNo || '31'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">CATEGORY</span>
                            <span className="font-bold text-[10px] uppercase text-slate-900 leading-tight">{employee.category || 'Skilled'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">DEPT</span>
                            <span className="font-bold text-[10px] uppercase text-slate-900 leading-tight">{employee.department || 'Assembly'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">JOINING</span>
                            <span className="font-bold text-[10px] font-mono text-slate-900 leading-tight">{employee.joiningDate || '2026-01-20'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom ID Badge Footer */}
                    <div className="bg-slate-100 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-[9px]">
                      <span className="font-bold text-slate-700 uppercase">WORKER PASS</span>
                      <span className="font-mono text-slate-900 font-bold">MOB: {employee.phone || '06359322504'}</span>
                    </div>
                  </div>

                  {/* === ID CARD - BACKSIDE === */}
                  <div className="w-[340px] h-[220px] bg-white border-2 border-slate-900 rounded-xl overflow-hidden shadow-md flex flex-col justify-between relative print:shadow-none">
                    {/* Top Company Bar */}
                    <div className="bg-slate-800 text-white p-2 text-center border-b border-slate-700">
                      <span className="text-[10px] font-bold tracking-wider uppercase">IDENTITY CARD - BACKSIDE</span>
                    </div>

                    {/* Backside Details */}
                    <div className="p-3 text-[10px] space-y-1.5 text-slate-900 flex-1">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase block leading-none">FATHER / SPOUSE NAME</span>
                        <span className="font-extrabold text-[11px] uppercase text-slate-900 block">{employee.fatherName || employee.fatherOrSpouseName || 'TEST'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">UAN NO</span>
                          <span className="font-bold text-[10px] text-slate-900 font-mono">{employee.uan || '101393585342'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">AADHAR NO</span>
                          <span className="font-bold text-[10px] text-slate-900 font-mono">{employee.esicNo || '886365497514'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase block leading-none">PRESENT ADDRESS</span>
                        <span className="font-medium text-[9px] uppercase text-slate-800 line-clamp-2 block leading-tight">
                          {employee.presentAddress || employee.address || 'UMBERGAON GIDC KK SILK MILLS UNIT 3'}
                        </span>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                        <div>
                          <span className="text-[7px] font-bold text-slate-500 uppercase block">EMERGENCY PHONE</span>
                          <span className="font-bold text-[9px] font-mono text-slate-900">{employee.emergencyContact || employee.phone || '06359322504'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[7px] font-extrabold text-slate-700 uppercase block">AUTH SIGNATORY</span>
                          <span className="text-[8px] font-bold text-slate-900 font-serif border-t border-slate-400 pt-0.5 block">
                            Parishram HR
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Notice */}
                    <div className="bg-slate-900 text-white px-3 py-1 text-center text-[8px] font-medium">
                      If found, please return to Parishram Enterprises / Site Office
                    </div>
                  </div>

                </div>
              </div>

              {/* ---------------- SECTION 2: CAPTURED DOCUMENT IMAGES (FRONT & BACKSIDE) ---------------- */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                      2. ATTACHED IDENTITY DOCUMENTS (AADHAAR / PAN CARD SNAPSHOTS)
                    </h2>
                  </div>
                  {primaryDoc && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded">
                      {primaryDoc.type}
                    </span>
                  )}
                </div>

                {primaryDoc ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document Front Side */}
                    <div className="border-2 border-slate-900 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center mb-2 border-b pb-1 border-slate-300">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          FRONT SIDE - {primaryDoc.type}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {primaryDoc.capturedAt || 'Verified Snapshot'}
                        </span>
                      </div>
                      <div className="w-full flex justify-center bg-slate-50 p-2 rounded border border-slate-300 min-h-[160px]">
                        {primaryDoc.frontImage ? (
                          <img
                            src={primaryDoc.frontImage}
                            alt="Front Document"
                            className="max-h-[180px] w-auto object-contain rounded border border-slate-300 shadow-sm"
                          />
                        ) : (
                          <div className="flex items-center justify-center text-slate-400 text-xs">Front image snapshot unavailable</div>
                        )}
                      </div>
                    </div>

                    {/* Document Back Side */}
                    <div className="border-2 border-slate-900 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center mb-2 border-b pb-1 border-slate-300">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          BACKSIDE - {primaryDoc.type}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          Address & QR Details
                        </span>
                      </div>
                      <div className="w-full flex justify-center bg-slate-50 p-2 rounded border border-slate-300 min-h-[160px]">
                        {primaryDoc.backImage ? (
                          <img
                            src={primaryDoc.backImage}
                            alt="Back Document"
                            className="max-h-[180px] w-auto object-contain rounded border border-slate-300 shadow-sm"
                          />
                        ) : (
                          <div className="flex items-center justify-center text-slate-400 text-xs text-center p-6">
                            {primaryDoc.type === 'PAN Card'
                              ? 'PAN Card is a single-sided ID document.'
                              : 'Backside camera snapshot unavailable.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-xs font-medium">
                    No camera captured Aadhaar / PAN document image attached for this worker.
                  </div>
                )}
              </div>

            </div>

            {/* Page 2 Bottom Footer Verification Stamp */}
            <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-900 font-bold">
              <div>
                <span>Official Record Verified By: <strong>{settings.signatoryName || 'Parishram Enterprises HR'}</strong></span>
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                End of Personnel Record | Page 2 of 2
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer Bar (Hidden during Print) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-10 print:hidden">
          <span className="text-xs text-slate-600 font-semibold">Parishram Enterprises Official Form & ID Card Print Preview</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Both Pages
            </button>
            <button
              onClick={onClose}
              id="btn-close-employee-doc-footer"
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
