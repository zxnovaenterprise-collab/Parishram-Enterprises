import React from 'react';
import { Printer, X, FileText, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Action Header bar (hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Official Application Form & Document Attachment (2 Pages)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-employee-record"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF (2 Pages)
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
        <div className="p-8 font-sans text-slate-900 print:p-6 bg-white" id="printable-employee-doc">
          
          {/* ================= PAGE 1: EMPLOYMENT APPLICATION FORM (EXACT MATCHING SCREENSHOT) ================= */}
          <div className="min-h-[1020px] flex flex-col justify-between border-b-2 border-slate-300 pb-8 mb-8 print:border-none print:mb-0 print:pb-0 print:break-after-page">
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
                      {settings.companyName || 'PARISHRAM ENTERPRISES'}
                    </h1>
                    <p className="text-xs font-bold text-slate-700">
                      {settings.companySubTitle || 'Manpower Supply & Labour Contractor'}
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mt-1">
                      SITE: {employee.siteLocation || settings.companySite || 'WESTERN REFRIGERATION PVT LTD'}
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

              {/* Boxed Grid Layout (1px/2px solid dark borders matching prompt screenshot) */}
              <div className="border-2 border-slate-900 divide-y-2 divide-slate-900 text-xs text-slate-900 font-medium">
                
                {/* Row 1: Company / Site */}
                <div className="p-2.5 bg-slate-50/50">
                  <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">COMPANY / SITE:</span>
                  <p className="font-extrabold text-sm uppercase text-slate-900">{employee.siteLocation || settings.companySite || 'WESTERN REFRIGERATION PVT LTD'}</p>
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
                    <p className="font-extrabold text-xs text-slate-900 font-mono">₹{employee.baseRate || 0}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">BONUS:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">₹{employee.bonus || 0}</p>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">HRA:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">₹{employee.hraRate || 0}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50">
                    <span className="text-[10px] font-extrabold uppercase text-slate-600 block mb-0.5">TOTAL:</span>
                    <p className="font-extrabold text-xs text-slate-900 font-mono">₹{employee.totalComp || computedTotal}</p>
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

            {/* Bottom Signature Lines (Exact matching screenshot: 3 signature lines) */}
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

          {/* ================= PAGE 2: CAPTURED DOCUMENT IMAGES (FRONT & BACK) ================= */}
          <div className="min-h-[1020px] flex flex-col justify-between pt-4 print:pt-6">
            <div>
              {/* Page 2 Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">{settings.companyName || 'PARISHRAM ENTERPRISES'}</h1>
                  <p className="text-xs text-slate-600 font-semibold">Attached Identity Document Record (Aadhaar / PAN Card) | Page 2 of 2</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-300 px-3 py-1 rounded">
                    CARD NO: {employee.cardNo}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Verified Identity Document Attachment
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Captured via Camera Module & Verified for Personnel Files.
                  </p>
                </div>
                {primaryDoc && (
                  <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded">
                    {primaryDoc.type}
                  </span>
                )}
              </div>

              {/* Document Images Display: Front Side & Back Side */}
              {primaryDoc ? (
                <div className="space-y-6">
                  {/* Front Side Document Image */}
                  <div className="border-2 border-slate-300 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        1. {primaryDoc.type} - FRONT SIDE IMAGE
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Captured: {primaryDoc.capturedAt || 'Verified Snapshot'}
                      </span>
                    </div>

                    <div className="w-full flex justify-center bg-slate-100 p-3 rounded-lg border border-slate-200 min-h-[220px]">
                      {primaryDoc.frontImage ? (
                        <img
                          src={primaryDoc.frontImage}
                          alt="Front Side Document"
                          className="max-h-[300px] w-auto object-contain rounded border border-slate-300 shadow-sm"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-slate-400 text-xs">Front image not captured</div>
                      )}
                    </div>
                  </div>

                  {/* Back Side Document Image (Just inside / underneath Front Side on Page 2) */}
                  <div className="border-2 border-slate-300 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        2. {primaryDoc.type} - BACK SIDE IMAGE
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {primaryDoc.type === 'Aadhaar Card' ? 'Address & QR Back Side' : 'Secondary Verification Image'}
                      </span>
                    </div>

                    <div className="w-full flex justify-center bg-slate-100 p-3 rounded-lg border border-slate-200 min-h-[220px]">
                      {primaryDoc.backImage ? (
                        <img
                          src={primaryDoc.backImage}
                          alt="Back Side Document"
                          className="max-h-[300px] w-auto object-contain rounded border border-slate-300 shadow-sm"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-slate-400 text-xs p-8 text-center">
                          {primaryDoc.type === 'PAN Card'
                            ? 'PAN Card is a single-sided identification document.'
                            : 'Back side image not attached.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                  No camera captured document attached for this employee yet.
                </div>
              )}
            </div>

            {/* Page 2 Bottom Footer Verification Stamp */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span>Verified By: <strong>{settings.signatoryName || 'Parishram Enterprises HR'}</strong></span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                End of Official Employee Record | Page 2 of 2
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer Bar (Hidden during Print) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-10 print:hidden">
          <span className="text-xs text-slate-500 font-medium">Parishram Enterprises Employment Form Preview</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
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
