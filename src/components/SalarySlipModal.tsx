import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { PayrollRecord, CompanySettings } from '../types';
import { formatINR, numberToWords } from '../lib/calculations';

interface SalarySlipModalProps {
  record: PayrollRecord | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  record,
  settings,
  onClose,
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold">Salary Slip Preview & Print</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-payslip"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              id="btn-close-payslip"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Payslip Document Body */}
        <div className="p-8 text-slate-800 font-sans print:p-6" id="printable-payslip">
          {/* Header Block */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">{settings.companyName}</h1>
                <p className="text-xs text-slate-600 max-w-md mt-1">{settings.companyAddress}</p>
                <p className="text-xs text-slate-500 mt-0.5">Phone: {settings.companyPhone} | Email: {settings.companyEmail}</p>
                {settings.companyGst && <p className="text-xs text-slate-500">GSTIN: {settings.companyGst}</p>}
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold uppercase text-slate-700">
                  Payslip for {record.monthYear}
                </span>
                <p className="text-xs text-slate-400 mt-2">Generated: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Employee & Statutory Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{record.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Card No / Emp ID</span>
              <span className="font-semibold text-slate-800">{record.cardNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Designation</span>
              <span className="font-semibold text-slate-800">{record.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Department / AGT</span>
              <span className="font-semibold text-slate-800">{record.department} ({record.agt})</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">UAN Number</span>
              <span className="font-mono text-slate-800">{record.uan || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">ESIC Number</span>
              <span className="font-mono text-slate-800">{record.esicNo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Bank A/C No</span>
              <span className="font-mono text-slate-800">{record.accountNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">IFSC Code</span>
              <span className="font-mono text-slate-800">{record.ifscCode || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Present Days</span>
              <span className="font-bold text-slate-900">{record.days} Days ({record.hrs} Hrs)</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Paid Holidays</span>
              <span className="font-semibold text-slate-800">{record.ph} Days</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Overtime Days</span>
              <span className="font-semibold text-slate-800">{record.otDays} Days</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Base Rate</span>
              <span className="font-semibold text-slate-800">{formatINR(record.rate)} / day</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-2 border border-slate-300 rounded-lg overflow-hidden text-xs mb-6">
            {/* Earnings Column */}
            <div className="border-r border-slate-300">
              <div className="bg-slate-100 font-bold px-4 py-2 text-slate-900 border-b border-slate-300 flex justify-between">
                <span>EARNINGS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div className="p-4 space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Basic Earned Salary ({record.days} days)</span>
                  <span className="font-mono">{formatINR(record.salary)}</span>
                </div>
                {record.hra > 0 && (
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-mono">{formatINR(record.hra)}</span>
                  </div>
                )}
                {record.bonus > 0 && (
                  <div className="flex justify-between">
                    <span>Bonus</span>
                    <span className="font-mono">{formatINR(record.bonus)}</span>
                  </div>
                )}
                {record.otPay > 0 && (
                  <div className="flex justify-between">
                    <span>Overtime Pay ({record.otDays} days @ {record.otRate})</span>
                    <span className="font-mono">{formatINR(record.otPay)}</span>
                  </div>
                )}
                {record.leaveEncashment > 0 && (
                  <div className="flex justify-between">
                    <span>Leave Encashment</span>
                    <span className="font-mono">{formatINR(record.leaveEncashment)}</span>
                  </div>
                )}
                {record.trnAllowance > 0 && (
                  <div className="flex justify-between">
                    <span>Transport Allowance</span>
                    <span className="font-mono">{formatINR(record.trnAllowance)}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 font-bold px-4 py-2 border-t border-slate-300 flex justify-between text-slate-900">
                <span>TOTAL GROSS (AMT)</span>
                <span className="font-mono text-sm">{formatINR(record.amt)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <div className="bg-slate-100 font-bold px-4 py-2 text-slate-900 border-b border-slate-300 flex justify-between">
                <span>DEDUCTIONS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div className="p-4 space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Provident Fund (P.F.)</span>
                  <span className="font-mono">{formatINR(record.pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESIC Deduction</span>
                  <span className="font-mono">{formatINR(record.esic)}</span>
                </div>
                {record.pt > 0 && (
                  <div className="flex justify-between">
                    <span>Professional Tax (PT)</span>
                    <span className="font-mono">{formatINR(record.pt)}</span>
                  </div>
                )}
                {record.gwlf > 0 && (
                  <div className="flex justify-between">
                    <span>GWLF (Labour Welfare)</span>
                    <span className="font-mono">{formatINR(record.gwlf)}</span>
                  </div>
                )}
                {record.advance > 0 && (
                  <div className="flex justify-between">
                    <span>Salary Advance</span>
                    <span className="font-mono">{formatINR(record.advance)}</span>
                  </div>
                )}
                {record.food > 0 && (
                  <div className="flex justify-between">
                    <span>Food Charges</span>
                    <span className="font-mono">{formatINR(record.food)}</span>
                  </div>
                )}
                {record.rr > 0 && (
                  <div className="flex justify-between">
                    <span>Room / Rent Deduction</span>
                    <span className="font-mono">{formatINR(record.rr)}</span>
                  </div>
                )}
                {record.trn > 0 && (
                  <div className="flex justify-between">
                    <span>Transport Deduction</span>
                    <span className="font-mono">{formatINR(record.trn)}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 font-bold px-4 py-2 border-t border-slate-300 flex justify-between text-rose-700">
                <span>TOTAL DEDUCTIONS</span>
                <span className="font-mono text-sm">{formatINR(record.totalDeduction)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase text-emerald-800 font-bold block">NET PAYABLE SALARY</span>
              <span className="text-xs text-emerald-700 font-medium">In Words: {numberToWords(record.netSalary)}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-900 font-mono">{formatINR(record.netSalary)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                Employee Signature
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">[{record.name}]</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                Authorized Signatory
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{settings.signatoryName || 'For Apex Precision Engineering'}</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            This is a computer-generated salary slip and does not require a physical signature if verified online.
          </div>
        </div>

        {/* Modal Action Footer (Hidden in Print) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-medium">Click Print or Close window when done.</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Payslip
            </button>
            <button
              onClick={onClose}
              id="btn-close-payslip-footer"
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
