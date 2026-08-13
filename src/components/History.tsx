import React, { useState } from 'react';
import { 
  History as HistoryIcon, Search, Filter, Download, Printer, Edit2, Trash2, 
  Eye, CheckCircle2, Calendar, Building, FileSpreadsheet, Plus, X, RefreshCw, 
  ChevronRight, ArrowRight, Save, BookmarkCheck, Calculator
} from 'lucide-react';
import { PayrollHistoryBatch, PayrollRecord, CompanySettings } from '../types';
import { formatINR, calculatePayrollRow } from '../lib/calculations';
import { exportPayrollToExcel } from '../lib/excel';
import { saveHistoryBatchToFirestore, deleteHistoryBatchFromFirestore, deleteBatchHistoryFromFirestore } from '../lib/firebase';
import { SearchableCompanySelect } from './SearchableCompanySelect';

interface HistoryProps {
  historyBatches: PayrollHistoryBatch[];
  setHistoryBatches: React.Dispatch<React.SetStateAction<PayrollHistoryBatch[]>>;
  settings: CompanySettings;
  onPrintSlip: (record: PayrollRecord) => void;
  onLoadBatchToActivePayroll?: (batch: PayrollHistoryBatch) => void;
}

export const History: React.FC<HistoryProps> = ({
  historyBatches,
  setHistoryBatches,
  settings,
  onPrintSlip,
  onLoadBatchToActivePayroll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');

  // Active snapshot being viewed/edited in full detail modal
  const [selectedBatch, setSelectedBatch] = useState<PayrollHistoryBatch | null>(null);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Individual record edit modal within selected batch
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selection state for History Batches
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  // Selection state for Records inside Selected History Batch Modal
  const [selectedRecordIdsInBatch, setSelectedRecordIdsInBatch] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter batches
  const filteredBatches = historyBatches.filter((batch) => {
    const matchesSearch = 
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.monthYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.clientCompany && batch.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCompany = 
      selectedCompanyFilter === 'ALL' || 
      batch.clientCompany === selectedCompanyFilter;

    return matchesSearch && matchesCompany;
  });

  const isAllBatchesSelected = filteredBatches.length > 0 && filteredBatches.every((b) => selectedBatchIds.includes(b.id));

  const handleToggleSelectAllBatches = () => {
    if (isAllBatchesSelected) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(filteredBatches.map((b) => b.id));
    }
  };

  const handleToggleSelectBatch = (id: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteBatches = async () => {
    if (selectedBatchIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedBatchIds.length} selected history batch(es) from Cloud Firestore?`)) {
      const idsToDelete = [...selectedBatchIds];
      setHistoryBatches((prev) => prev.filter((b) => !idsToDelete.includes(b.id)));
      setSelectedBatchIds([]);
      await deleteBatchHistoryFromFirestore(idsToDelete);
      showToast(`Deleted ${idsToDelete.length} history batch(es) from database.`);
    }
  };

  const handleClearAllHistory = async () => {
    if (historyBatches.length === 0) return;
    if (confirm(`⚠️ DANGER: Are you sure you want to CLEAR ALL ${historyBatches.length} history snapshot batches from Firestore?`)) {
      const allIds = historyBatches.map((b) => b.id);
      setHistoryBatches([]);
      setSelectedBatchIds([]);
      if (selectedBatch) setSelectedBatch(null);
      await deleteBatchHistoryFromFirestore(allIds);
      showToast(`Cleared all history snapshot batches.`);
    }
  };

  // Bulk actions inside selected batch modal
  const filteredRecordsInBatch = selectedBatch ? selectedBatch.records.filter((r) =>
    r.name.toLowerCase().includes(batchSearchTerm.toLowerCase()) ||
    r.cardNo.toLowerCase().includes(batchSearchTerm.toLowerCase())
  ) : [];

  const isAllRecordsInBatchSelected = filteredRecordsInBatch.length > 0 && filteredRecordsInBatch.every((r) => selectedRecordIdsInBatch.includes(r.id));

  const handleToggleSelectAllRecordsInBatch = () => {
    if (isAllRecordsInBatchSelected) {
      setSelectedRecordIdsInBatch([]);
    } else {
      setSelectedRecordIdsInBatch(filteredRecordsInBatch.map((r) => r.id));
    }
  };

  const handleToggleSelectRecordInBatch = (id: string) => {
    setSelectedRecordIdsInBatch((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteRecordsInBatch = async () => {
    if (!selectedBatch || selectedRecordIdsInBatch.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRecordIdsInBatch.length} selected worker record(s) from this history batch?`)) {
      const remainingRecords = selectedBatch.records.filter((r) => !selectedRecordIdsInBatch.includes(r.id));
      const updatedTotalNet = remainingRecords.reduce((sum, r) => sum + r.netSalary, 0);

      const updatedBatch: PayrollHistoryBatch = {
        ...selectedBatch,
        totalEmployees: remainingRecords.length,
        totalNetSalary: updatedTotalNet,
        records: remainingRecords,
      };

      setSelectedBatch(updatedBatch);
      setHistoryBatches((prev) => prev.map((b) => b.id === updatedBatch.id ? updatedBatch : b));
      setSelectedRecordIdsInBatch([]);
      await saveHistoryBatchToFirestore(updatedBatch);
      showToast(`Deleted ${selectedRecordIdsInBatch.length} worker record(s) from history batch.`);
    }
  };

  // Unique companies in history
  const historyCompanies = Array.from(
    new Set(historyBatches.map((b) => b.clientCompany).filter(Boolean) as string[])
  );

  // Delete batch from history
  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (confirm(`Are you sure you want to permanently delete the history batch "${batchName}"?`)) {
      setHistoryBatches((prev) => prev.filter((b) => b.id !== batchId));
      if (selectedBatch?.id === batchId) {
        setSelectedBatch(null);
      }
      await deleteHistoryBatchFromFirestore(batchId);
      showToast(`History batch "${batchName}" deleted.`);
    }
  };

  // Handle saving an edited record inside a history batch
  const handleSaveEditedRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !selectedBatch) return;

    const recalculated = calculatePayrollRow(editingRecord);

    const updatedRecords = selectedBatch.records.map((r) => 
      r.id === recalculated.id ? recalculated : r
    );

    const updatedTotalNet = updatedRecords.reduce((sum, r) => sum + r.netSalary, 0);

    const updatedBatch: PayrollHistoryBatch = {
      ...selectedBatch,
      totalEmployees: updatedRecords.length,
      totalNetSalary: updatedTotalNet,
      records: updatedRecords,
    };

    setSelectedBatch(updatedBatch);
    setHistoryBatches((prev) => prev.map((b) => b.id === updatedBatch.id ? updatedBatch : b));
    await saveHistoryBatchToFirestore(updatedBatch);

    setEditingRecord(null);
    showToast(`Updated record for ${recalculated.name} in history batch.`);
  };

  // Handle deleting individual row from inside a history batch
  const handleDeleteRecordInBatch = async (recordId: string) => {
    if (!selectedBatch) return;
    if (confirm('Delete this employee record from this historical snapshot batch?')) {
      const updatedRecords = selectedBatch.records.filter((r) => r.id !== recordId);
      const updatedTotalNet = updatedRecords.reduce((sum, r) => sum + r.netSalary, 0);

      const updatedBatch: PayrollHistoryBatch = {
        ...selectedBatch,
        totalEmployees: updatedRecords.length,
        totalNetSalary: updatedTotalNet,
        records: updatedRecords,
      };

      setSelectedBatch(updatedBatch);
      setHistoryBatches((prev) => prev.map((b) => b.id === updatedBatch.id ? updatedBatch : b));
      await saveHistoryBatchToFirestore(updatedBatch);
      showToast('Employee deleted from history batch.');
    }
  };

  // Stats calculation
  const totalArchivedSnapshots = historyBatches.length;
  const totalArchivedStaff = historyBatches.reduce((acc, b) => acc + b.totalEmployees, 0);
  const totalHistoricalPayout = historyBatches.reduce((acc, b) => acc + b.totalNetSalary, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 print:hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Payroll History & Archived Snapshots
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Synced to Cloud
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Saved payroll snapshots for prior months and client sites. Review, edit, export, and print payslips anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saved Batches</div>
            <div className="text-lg font-black text-white font-mono mt-0.5">{totalArchivedSnapshots}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Staff Count</div>
            <div className="text-lg font-black text-blue-400 font-mono mt-0.5">{totalArchivedStaff}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Payout</div>
            <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatINR(totalHistoricalPayout)}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by batch name, month, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-300">
            <input
              type="checkbox"
              checked={isAllBatchesSelected}
              onChange={handleToggleSelectAllBatches}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Select All</span>
          </label>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Company:</span>
          </div>
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Companies ({historyBatches.length})</option>
            {historyCompanies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {historyBatches.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              title="Permanently Delete All Saved History Snapshots"
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar for Batches */}
      {selectedBatchIds.length > 0 && (
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-4 animate-fadeIn">
          <span className="text-xs font-bold text-slate-300">
            Selected <strong className="text-blue-400 font-mono text-sm">{selectedBatchIds.length}</strong> History Batch(es)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDeleteBatches}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedBatchIds.length})
            </button>
          </div>
        </div>
      )}

      {/* History Batches Grid / Cards List */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Saved Payroll Snapshots Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            You haven't saved any payroll sheets to history yet. Go to the <strong className="text-blue-600">Payroll & Slips</strong> tab, click <strong className="text-blue-600">"Save to History"</strong> to save snapshot batches!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map((batch) => {
            const isSelected = selectedBatchIds.includes(batch.id);
            return (
              <div
                key={batch.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between group relative overflow-hidden ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20' : 'border-slate-200/90 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

                <div>
                  {/* Company & Date Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectBatch(batch.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold">
                        <Building className="w-3.5 h-3.5 text-blue-500" />
                        {batch.clientCompany || 'General Payroll'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(batch.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                {/* Batch Name Title */}
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {batch.batchName}
                </h3>

                {/* Metrics Summary */}
                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 my-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Staff Count</span>
                    <strong className="text-sm font-extrabold text-slate-800 font-mono">{batch.totalEmployees} Employees</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Net Salary Sum</span>
                    <strong className="text-sm font-extrabold text-emerald-600 font-mono">{formatINR(batch.totalNetSalary)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBatch(batch)}
                  id={`btn-view-batch-${batch.id}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View & Review
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => exportPayrollToExcel(batch.records, batch.batchName)}
                    id={`btn-export-batch-${batch.id}`}
                    title="Export Batch to Excel"
                    className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {onLoadBatchToActivePayroll && (
                    <button
                      onClick={() => onLoadBatchToActivePayroll(batch)}
                      id={`btn-load-batch-${batch.id}`}
                      title="Load snapshot into active Payroll tab"
                      className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteBatch(batch.id, batch.batchName)}
                    id={`btn-delete-batch-${batch.id}`}
                    title="Delete Batch from History"
                    className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* BATCH DETAIL MODAL / REVIEW SHEET */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                    {selectedBatch.clientCompany || 'Saved History Batch'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(selectedBatch.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {selectedBatch.batchName}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => exportPayrollToExcel(selectedBatch.records, selectedBatch.batchName)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Excel
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Batch Sheet
                </button>

                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Batch Search & Metrics */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter records in this batch..."
                  value={batchSearchTerm}
                  onChange={(e) => setBatchSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700">
                {selectedRecordIdsInBatch.length > 0 && (
                  <button
                    onClick={handleBulkDeleteRecordsInBatch}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-lg shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected ({selectedRecordIdsInBatch.length})
                  </button>
                )}
                <span>Total Staff: <strong className="text-blue-600">{selectedBatch.records.length}</strong></span>
                <span>Net Payout: <strong className="text-emerald-600">{formatINR(selectedBatch.totalNetSalary)}</strong></span>
              </div>
            </div>

            {/* Payroll Sheet Table */}
            <div className="flex-1 overflow-auto p-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2 border-b border-slate-800 text-center w-10">
                        <input
                          type="checkbox"
                          checked={isAllRecordsInBatchSelected}
                          onChange={handleToggleSelectAllRecordsInBatch}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-2 border-b border-slate-800 text-center w-8">#</th>
                      <th className="p-2 border-b border-slate-800">Card No</th>
                      <th className="p-2 border-b border-slate-800">Name</th>
                      <th className="p-2 border-b border-slate-800">Days</th>
                      <th className="p-2 border-b border-slate-800">Daily Rate</th>
                      <th className="p-2 border-b border-slate-800">Earned Salary</th>
                      <th className="p-2 border-b border-slate-800 text-rose-300">PF</th>
                      <th className="p-2 border-b border-slate-800 text-rose-300">ESIC</th>
                      <th className="p-2 border-b border-slate-800 text-rose-300">Advance/Deductions</th>
                      <th className="p-2 border-b border-slate-800 text-emerald-400 font-extrabold">Net Salary</th>
                      <th className="p-2 border-b border-slate-800 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecordsInBatch.map((rec, index) => {
                      const isSelected = selectedRecordIdsInBatch.includes(rec.id);
                      return (
                        <tr key={rec.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-blue-50/50'}`}>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRecordInBatch(rec.id)}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-slate-500">{index + 1}</td>
                          <td className="p-2 font-mono font-bold text-slate-800">{rec.cardNo}</td>
                          <td className="p-2 font-bold text-slate-900">{rec.name}</td>
                          <td className="p-2 font-mono font-bold text-blue-700">{rec.days}</td>
                          <td className="p-2 font-mono text-slate-700">₹{rec.rate}</td>
                          <td className="p-2 font-mono text-slate-800">₹{rec.salary}</td>
                          <td className="p-2 font-mono text-rose-600">₹{rec.pf}</td>
                          <td className="p-2 font-mono text-rose-600">₹{rec.esic}</td>
                          <td className="p-2 font-mono text-rose-600">₹{rec.totalDeduction}</td>
                          <td className="p-2 font-mono font-black text-emerald-600 text-xs">₹{rec.netSalary}</td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onPrintSlip(rec)}
                                title="Print Payslip"
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingRecord(rec)}
                                title="Edit Row"
                                className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecordInBatch(rec.id)}
                                title="Delete Row"
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL INSIDE BATCH */}
      {editingRecord && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Snapshot Record for {editingRecord.name}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card No</label>
                  <input
                    type="text"
                    value={editingRecord.cardNo}
                    onChange={(e) => setEditingRecord({ ...editingRecord, cardNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingRecord.name}
                    onChange={(e) => setEditingRecord({ ...editingRecord, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Present Days</label>
                  <input
                    type="number"
                    value={editingRecord.days}
                    onChange={(e) => setEditingRecord({ ...editingRecord, days: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.rate}
                    onChange={(e) => setEditingRecord({ ...editingRecord, rate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.advance}
                    onChange={(e) => setEditingRecord({ ...editingRecord, advance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Changes to History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
