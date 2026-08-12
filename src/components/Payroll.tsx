import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Download, FileCheck, Search, Filter, Plus, 
  Printer, Edit2, Trash2, RefreshCw, ChevronRight, Calculator, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PayrollRecord, CompanySettings } from '../types';
import { formatINR, calculatePayrollRow } from '../lib/calculations';
import { downloadSampleExcel, exportPayrollToExcel, parseExcelOrCsvFile } from '../lib/excel';

interface PayrollProps {
  records: PayrollRecord[];
  setRecords: React.Dispatch<React.SetStateAction<PayrollRecord[]>>;
  settings: CompanySettings;
  onPrintSlip: (record: PayrollRecord) => void;
}

export const Payroll: React.FC<PayrollProps> = ({
  records,
  setRecords,
  settings,
  onPrintSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<PayrollRecord> | null>(null);

  // Import notification state
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.uan.includes(searchTerm) ||
      r.accountNumber.includes(searchTerm);

    const matchesAgent = selectedAgentFilter === 'ALL' || r.agt === selectedAgentFilter;

    return matchesSearch && matchesAgent;
  });

  // Agents list
  const uniqueAgents = Array.from(new Set(records.map((r) => r.agt).filter(Boolean)));

  // File Import handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus({ message: 'Parsing and validating Excel file...', type: 'success' });
      const importedRows = await parseExcelOrCsvFile(file);

      if (importedRows.length === 0) {
        setImportStatus({ message: 'No valid data rows found in the selected file.', type: 'error' });
        return;
      }

      setRecords(importedRows);
      setImportStatus({
        message: `Successfully imported ${importedRows.length} employee payroll rows!`,
        type: 'success',
      });

      // Clear input
      e.target.value = '';
    } catch (err: any) {
      console.error('Import error:', err);
      setImportStatus({
        message: 'Failed to parse file. Please ensure you are using the sample Excel format.',
        type: 'error',
      });
    }
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (confirm('Are you sure you want to delete this employee payroll row?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Add / Edit Modal Submit
  const handleSaveAddEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const computedRow = calculatePayrollRow(editingRecord);

    if (editingRecord.id) {
      // Edit
      setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? computedRow : r)));
    } else {
      // Add
      setRecords((prev) => [...prev, computedRow]);
    }

    setIsAddEditModalOpen(false);
    setEditingRecord(null);
  };

  // Totals
  const totalDays = filteredRecords.reduce((acc, r) => acc + r.days, 0);
  const totalSalary = filteredRecords.reduce((acc, r) => acc + r.salary, 0);
  const totalPF = filteredRecords.reduce((acc, r) => acc + r.pf, 0);
  const totalESIC = filteredRecords.reduce((acc, r) => acc + r.esic, 0);
  const totalDeduction = filteredRecords.reduce((acc, r) => acc + r.totalDeduction, 0);
  const totalNetSalary = filteredRecords.reduce((acc, r) => acc + r.netSalary, 0);
  const totalAmt = filteredRecords.reduce((acc, r) => acc + r.amt, 0);

  return (
    <div className="space-y-6">
      {/* Action Header & Import/Export Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              Master Payroll Sheet ({records.length} Employees)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Includes all 33 required statutory, deduction, bank, and overtime parameters. Download sample, import Excel, and print salary slips directly.
            </p>
          </div>

          {/* Import/Export & Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Sample Excel */}
            <button
              onClick={downloadSampleExcel}
              id="btn-download-sample-excel"
              title="Download preformatted Excel template with all 33 columns"
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-600" />
              Download Sample Excel
            </button>

            {/* Import Data */}
            <label
              id="btn-import-excel-label"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4" />
              Import Data (Excel/CSV)
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Export All Data */}
            <button
              onClick={() => exportPayrollToExcel(records)}
              id="btn-export-all-payroll"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export All Data
            </button>

            {/* Add Employee Row */}
            <button
              onClick={() => {
                setEditingRecord({
                  sn: records.length + 1,
                  cardNo: `EMP-${101 + records.length}`,
                  days: 26,
                  rate: 850,
                  name: '',
                  uan: '',
                  esicNo: '',
                  accountNumber: '',
                  ifscCode: '',
                  agt: 'AGT-NORTH',
                });
                setIsAddEditModalOpen(true);
              }}
              id="btn-add-payroll-row"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{importStatus.message}</span>
            </div>
            <button
              onClick={() => setImportStatus(null)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Card No, UAN, A/C No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">AGT / Contractor:</span>
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All AGT / Contractors</option>
              {uniqueAgents.map((agt) => (
                <option key={agt} value={agt}>
                  {agt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complete 33-Column Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead className="bg-slate-900 text-slate-200 sticky top-0 z-20 uppercase font-semibold tracking-wider text-[10px]">
              <tr>
                {/* Actions Column */}
                <th className="p-3 sticky left-0 bg-slate-900 z-30 border-b border-r border-slate-800 text-center w-20">
                  ACTION
                </th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[50px] text-center">S.N.</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[90px] font-bold text-blue-300">CARD NO</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[120px]">UAN</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[120px]">ESIC</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[160px] font-bold text-white">NAME</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[60px] text-right">DAYS</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[60px] text-right">HRS</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[50px] text-right">PH</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">RATE</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[90px] text-right text-emerald-300">SALARY</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right text-amber-300">P.F.</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right text-amber-300">ESIC</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[60px] text-right">GWLF</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[60px] text-right">PT</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right text-rose-300">ADVANCE</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">TRN</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">R/R</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">FOOD</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[100px] text-right text-rose-400 font-bold">
                  TOTAL DECTION
                </th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[110px] text-right text-emerald-400 font-black">
                  NET SALARY
                </th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[130px]">A/C. NUMBER</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[100px]">IFS CODE</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[90px]">AGT</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[60px] text-right">DAYS (OT)</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">RATE (OT)</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">WAGES</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">PF (EMP)</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">TRN</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">BONUS</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">HRA</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[70px] text-right">LEAVE</th>
                <th className="p-3 border-b border-r border-slate-800 min-w-[80px] text-right">OT</th>
                <th className="p-3 border-b border-slate-800 min-w-[110px] text-right font-black text-blue-300">AMT</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-blue-50/50 transition-colors group">
                    {/* Sticky Action Cell */}
                    <td className="p-2 sticky left-0 bg-white group-hover:bg-blue-50/90 z-10 border-r border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPrintSlip(r)}
                          title="Print Salary Slip"
                          id={`btn-print-slip-${r.cardNo}`}
                          className="p-1 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded cursor-pointer transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setIsAddEditModalOpen(true);
                          }}
                          title="Edit Row"
                          className="p-1 bg-slate-100 hover:bg-slate-700 text-slate-700 hover:text-white rounded cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(r.id)}
                          title="Delete Row"
                          className="p-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500">{r.sn || idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-blue-700 font-mono">{r.cardNo}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{r.uan || '-'}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-600">{r.esicNo || '-'}</td>
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">{r.name}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-medium">{r.days}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-500">{r.hrs}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">{r.ph}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">₹{r.rate}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-800">
                      {formatINR(r.salary)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">₹{r.pf}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">₹{r.esic}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.gwlf}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.pt}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-rose-700">₹{r.advance}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.trn}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.rr}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.food}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-rose-700 bg-rose-50/30">
                      {formatINR(r.totalDeduction)}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-black text-emerald-900 bg-emerald-50/50">
                      {formatINR(r.netSalary)}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-700">{r.accountNumber || '-'}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-slate-700">{r.ifscCode || '-'}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">{r.agt}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono">{r.otDays}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.otRate}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.wages}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.employerPf}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.trnAllowance}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.bonus}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.hra}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.leaveEncashment}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">₹{r.otPay}</td>
                    <td className="p-2 border-r border-slate-200 text-right font-mono font-black text-blue-900 bg-blue-50/50">
                      {formatINR(r.amt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={34} className="p-12 text-center text-slate-400 text-xs">
                    No payroll records matching search filter.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-900 text-white font-bold text-[11px] sticky bottom-0 z-20">
              <tr>
                <td className="p-3 sticky left-0 bg-slate-900 border-t border-r border-slate-800 text-center">TOTAL</td>
                <td colSpan={5} className="p-3 border-t border-r border-slate-800 uppercase tracking-wider text-slate-300">
                  Total for {filteredRecords.length} Employees
                </td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono">{totalDays}</td>
                <td colSpan={3} className="p-3 border-t border-r border-slate-800"></td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono text-emerald-300">
                  {formatINR(totalSalary)}
                </td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono text-amber-300">
                  {formatINR(totalPF)}
                </td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono text-amber-300">
                  {formatINR(totalESIC)}
                </td>
                <td colSpan={6} className="p-3 border-t border-r border-slate-800"></td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono text-rose-400 font-black">
                  {formatINR(totalDeduction)}
                </td>
                <td className="p-3 border-t border-r border-slate-800 text-right font-mono text-emerald-400 font-black text-xs">
                  {formatINR(totalNetSalary)}
                </td>
                <td colSpan={12} className="p-3 border-t border-r border-slate-800"></td>
                <td className="p-3 border-t border-slate-800 text-right font-mono text-blue-300 font-black text-xs">
                  {formatINR(totalAmt)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add / Edit Row Modal */}
      {isAddEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingRecord.id ? 'Edit Payroll Entry' : 'Add New Payroll Entry'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddEditModalOpen(false);
                  setEditingRecord(null);
                }}
                id="btn-close-payroll-modal"
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAddEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Card No / Emp ID</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.cardNo || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, cardNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Employee Name</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.name || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Days Worked</label>
                  <input
                    type="number"
                    required
                    value={editingRecord.days !== undefined ? editingRecord.days : 26}
                    onChange={(e) => setEditingRecord({ ...editingRecord, days: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Base Day Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingRecord.rate !== undefined ? editingRecord.rate : 850}
                    onChange={(e) => setEditingRecord({ ...editingRecord, rate: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">UAN Number</label>
                  <input
                    type="text"
                    value={editingRecord.uan || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, uan: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ESIC Number</label>
                  <input
                    type="text"
                    value={editingRecord.esicNo || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, esicNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank A/C Number</label>
                  <input
                    type="text"
                    value={editingRecord.accountNumber || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, accountNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={editingRecord.ifscCode || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ifscCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">AGT / Contractor</label>
                  <input
                    type="text"
                    value={editingRecord.agt || 'AGT-NORTH'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, agt: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Advance Taken (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.advance || 0}
                    onChange={(e) => setEditingRecord({ ...editingRecord, advance: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bonus (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.bonus || 0}
                    onChange={(e) => setEditingRecord({ ...editingRecord, bonus: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">HRA Allowance (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.hra || 0}
                    onChange={(e) => setEditingRecord({ ...editingRecord, hra: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow"
                >
                  Save Payroll Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
