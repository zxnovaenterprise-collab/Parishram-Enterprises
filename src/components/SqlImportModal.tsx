import React, { useState, useRef } from 'react';
import { Database, Upload, FileCode, CheckCircle2, AlertTriangle, X, Play, RefreshCw, Building } from 'lucide-react';
import { EmployeeForm, PayrollRecord } from '../types';
import { parseSqlDump, SqlImportResult } from '../lib/sqlImporter';

interface SqlImportModalProps {
  onImportSuccess: (importedEmployees: EmployeeForm[], importedPayroll: PayrollRecord[]) => void;
  onClose: () => void;
}

export const SqlImportModal: React.FC<SqlImportModalProps> = ({ onImportSuccess, onClose }) => {
  const [sqlText, setSqlText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<SqlImportResult | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample SQL snippet for quick user testing
  const sampleSqlSnippet = `-- Sample Employee & Payroll SQL Dump
INSERT INTO \`employees\` (\`cardNo\`, \`fullName\`, \`fatherName\`, \`phone\`, \`siteLocation\`, \`baseRate\`, \`uan\`, \`esicNo\`, \`accountNumber\`, \`ifscCode\`) VALUES
('201', 'AMIT SHARMA', 'RAMESH SHARMA', '9811223344', 'SOHONI METALS PVT LTD', 900, '100987111222', '3100456000111', '501009876543', 'HDFC0000123'),
('202', 'VIKRAM SINGH', 'KALYAN SINGH', '9822334455', 'A1 FENCE PVT LTD', 850, '100987111223', '3100456000112', '918020034999', 'SBIN0001234'),
('203', 'SANDEEP PATEL', 'BHARAT PATEL', '9833445566', 'TPACK PACKING INDIA PVT LTD', 950, '100987111224', '3100456000113', '602101987111', 'ICIC0000456');

INSERT INTO \`payroll\` (\`cardNo\`, \`name\`, \`days\`, \`rate\`, \`clientCompany\`, \`otDays\`, \`advance\`, \`food\`, \`bonus\`) VALUES
('201', 'AMIT SHARMA', 26, 900, 'SOHONI METALS PVT LTD', 2, 1000, 500, 1500),
('202', 'VIKRAM SINGH', 25, 850, 'A1 FENCE PVT LTD', 3, 500, 400, 1200),
('203', 'SANDEEP PATEL', 26, 950, 'TPACK PACKING INDIA PVT LTD', 1, 0, 300, 2000);`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setSqlText(text);
      handleParseSql(text);
    };
    reader.readAsText(file);
  };

  const handleParseSql = (textToParse: string) => {
    setIsParsing(true);
    setTimeout(() => {
      const result = parseSqlDump(textToParse);
      setParseResult(result);
      setIsParsing(false);
    }, 150);
  };

  const handleLoadSample = () => {
    setSqlText(sampleSqlSnippet);
    setFileName('sample_dump.sql');
    handleParseSql(sampleSqlSnippet);
  };

  const handleConfirmImport = () => {
    if (parseResult && (parseResult.employees.length > 0 || parseResult.payrollRecords.length > 0)) {
      onImportSuccess(parseResult.employees, parseResult.payrollRecords);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                Import SQL Dump File
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  Employee & Payroll Data
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Upload or paste SQL queries containing <code className="text-blue-300">INSERT INTO</code> statements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-sql-import"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* File Upload / Preset Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload .SQL File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".sql,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              {fileName && (
                <span className="text-xs text-slate-300 font-mono bg-slate-800 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                  {fileName}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="w-full sm:w-auto text-xs text-blue-400 hover:text-blue-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              Load Sample SQL SQL
            </button>
          </div>

          {/* Text Area for Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
              <span>Paste SQL Query or File Contents:</span>
              {sqlText.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleParseSql(sqlText)}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Parse & Validate
                </button>
              )}
            </div>
            <textarea
              value={sqlText}
              onChange={(e) => {
                setSqlText(e.target.value);
                if (e.target.value.trim().length > 10) {
                  handleParseSql(e.target.value);
                }
              }}
              placeholder={`-- Paste your SQL dump here...\nINSERT INTO employees (cardNo, fullName, siteLocation, baseRate) VALUES ('101', 'Rajesh Verma', 'SOHONI METALS PVT LTD', 850);`}
              className="w-full h-36 bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Parsing Results / Preview Panel */}
          {isParsing ? (
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Parsing SQL queries and formatting fields...</span>
            </div>
          ) : parseResult ? (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">SQL Statements</span>
                  <span className="text-base font-bold text-white font-mono">{parseResult.rawStatementsCount} Found</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Employees Extracted</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{parseResult.employees.length} Rows</span>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Payroll Rows Extracted</span>
                  <span className="text-base font-bold text-blue-400 font-mono">{parseResult.payrollRecords.length} Rows</span>
                </div>
              </div>

              {/* Data Preview List */}
              {parseResult.employees.length > 0 && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-2.5 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Parsed Employees Preview ({parseResult.employees.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Will be imported into Form & Payroll</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    {parseResult.employees.slice(0, 10).map((emp, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-900/50">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-blue-400 font-bold">#{emp.cardNo}</span>
                          <span className="font-semibold text-slate-100 truncate">{emp.fullName}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold flex items-center gap-1 uppercase shrink-0">
                            <Building className="w-3 h-3 text-blue-400" />
                            {emp.siteLocation}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold shrink-0">
                          ₹{emp.baseRate}/day
                        </span>
                      </div>
                    ))}
                    {parseResult.employees.length > 10 && (
                      <div className="p-2 text-center text-[10px] text-slate-500 font-mono">
                        + {parseResult.employees.length - 10} more employee records...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parseResult || (parseResult.employees.length === 0 && parseResult.payrollRecords.length === 0)}
            id="btn-confirm-sql-import"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Import Parsed SQL Records
          </button>
        </div>
      </div>
    </div>
  );
};
