import React from 'react';
import { 
  Users, DollarSign, ArrowUpRight, TrendingUp, Award, Clock, 
  FileCheck2, ShieldCheck, Download, PlusCircle, Printer, FileSpreadsheet, Building, FileText
} from 'lucide-react';
import { PayrollRecord, EmployeeForm, CompanySettings, ActiveTab } from '../types';
import { formatINR } from '../lib/calculations';
import { downloadSampleExcel, exportPayrollToExcel } from '../lib/excel';

interface DashboardProps {
  payrollRecords: PayrollRecord[];
  employees: EmployeeForm[];
  settings: CompanySettings;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenForm: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  payrollRecords,
  employees,
  settings,
  setActiveTab,
  onOpenForm,
}) => {
  // Aggregate KPIs
  const totalEmployees = employees.length;
  const totalGrossPayroll = payrollRecords.reduce((acc, r) => acc + r.amt, 0);
  const totalNetSalary = payrollRecords.reduce((acc, r) => acc + r.netSalary, 0);
  const totalDeductions = payrollRecords.reduce((acc, r) => acc + r.totalDeduction, 0);
  const totalPF = payrollRecords.reduce((acc, r) => acc + r.pf + r.employerPf, 0);
  const totalESIC = payrollRecords.reduce((acc, r) => acc + r.esic, 0);
  const totalOvertimePay = payrollRecords.reduce((acc, r) => acc + r.otPay, 0);
  const totalOvertimeDays = payrollRecords.reduce((acc, r) => acc + r.otDays, 0);

  const avgDayRate = totalEmployees > 0 
    ? Math.round(payrollRecords.reduce((acc, r) => acc + r.rate, 0) / (payrollRecords.length || 1))
    : 0;

  // Department cost breakdown
  const deptCosts: Record<string, number> = {};
  payrollRecords.forEach(r => {
    const dept = r.department || r.agt || 'General';
    deptCosts[dept] = (deptCosts[dept] || 0) + r.netSalary;
  });

  return (
    <div className="space-y-8 animate-fadeIn print:hidden">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> HR & Payroll Control Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              {settings.companyName || 'Business Dashboard'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Real-time workforce monitoring, automated salary calculations, camera document verification, and one-click compliance exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenForm}
              id="btn-dash-new-employee"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Employee + Camera
            </button>
            <button
              onClick={() => exportPayrollToExcel(payrollRecords)}
              id="btn-dash-export-excel"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Payroll (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Net Payroll</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatINR(totalNetSalary)}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Net payout for {payrollRecords.length} staff members</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Employees</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalEmployees}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <span>Avg Daily Rate: <strong>{formatINR(avgDayRate)}</strong></span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Statutory & Deductions</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatINR(totalDeductions)}</h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span>PF: {formatINR(totalPF)}</span>
              <span>•</span>
              <span>ESIC: {formatINR(totalESIC)}</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overtime Spend</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatINR(totalOvertimePay)}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-700 font-medium">
              <span>{totalOvertimeDays} Overtime days logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Department Expense Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Department / AGT Cost Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly net salary allocation per unit/contractor</p>
            </div>
            <button
              onClick={() => setActiveTab('payroll')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Full Table <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(deptCosts).map(([dept, cost]) => {
              const percentage = totalNetSalary > 0 ? Math.round((cost / totalNetSalary) * 100) : 0;
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{dept}</span>
                    <span className="text-slate-600 font-mono">{formatINR(cost)} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Banner inside card */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Gross</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{formatINR(totalGrossPayroll)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Deductions</span>
              <span className="text-sm font-bold text-rose-600 font-mono">-{formatINR(totalDeductions)}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Net Paid</span>
              <span className="text-sm font-bold text-emerald-900 font-mono">{formatINR(totalNetSalary)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Shortcuts & Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Quick System Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('payroll')}
                id="btn-shortcut-payroll"
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-900">Manage Payroll Table</h4>
                    <p className="text-[11px] text-slate-500">View 33 columns, import & print salary slips</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={onOpenForm}
                id="btn-shortcut-camera-form"
                className="w-full p-3.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Add Form + Camera Docs</h4>
                    <p className="text-[11px] text-slate-500">Capture Aadhaar / PAN front & back side</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={downloadSampleExcel}
                id="btn-shortcut-sample-excel"
                className="w-full p-3.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-900">Download Sample Excel</h4>
                    <p className="text-[11px] text-slate-500">Pre-formatted sheet with all 33 headers</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <button
                onClick={() => setActiveTab('idcard')}
                id="btn-shortcut-id-cards"
                className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Print Staff ID Cards</h4>
                    <p className="text-[11px] text-slate-500">Generate Front & Back ID cards with barcodes</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            All records saved locally in browser state. Fully compatible with Excel import/export.
          </div>
        </div>
      </div>

      {/* Recent Onboarding Activity Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Recent Employee Onboarding & Document Verification
          </h3>
          <button
            onClick={() => setActiveTab('form')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Manage Onboarding Forms →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.slice(0, 3).map((emp) => {
            const hasDocs = emp.documents.length > 0;
            return (
              <div key={emp.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                <img
                  src={emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={emp.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{emp.fullName}</h4>
                    <span className="text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      {emp.cardNo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{emp.designation} • {emp.department}</p>
                  
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    {hasDocs ? (
                      <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {emp.documents[0].type} Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-semibold">
                        Document Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
