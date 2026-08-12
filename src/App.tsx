import React, { useState, useEffect } from 'react';
import { ActiveTab, CompanySettings, EmployeeForm, PayrollRecord } from './types';
import { initialCompanySettings, sampleEmployees, samplePayrollRecords } from './data/initialData';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Payroll } from './components/Payroll';
import { Form } from './components/Form';
import { IDCard } from './components/IDCard';
import { Settings } from './components/Settings';
import { SalarySlipModal } from './components/SalarySlipModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // LocalStorage state initialization
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('apex_company_settings');
    return saved ? JSON.parse(saved) : initialCompanySettings;
  });

  const [employees, setEmployees] = useState<EmployeeForm[]>(() => {
    const saved = localStorage.getItem('apex_employees_data');
    return saved ? JSON.parse(saved) : sampleEmployees;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('apex_payroll_records');
    return saved ? JSON.parse(saved) : samplePayrollRecords;
  });

  // Modal for salary slip print preview
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('apex_company_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('apex_employees_data', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('apex_payroll_records', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  // Reset to initial sample dataset
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to original sample records?')) {
      setSettings(initialCompanySettings);
      setEmployees(sampleEmployees);
      setPayrollRecords(samplePayrollRecords);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        employeeCount={employees.length}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            payrollRecords={payrollRecords}
            employees={employees}
            settings={settings}
            setActiveTab={setActiveTab}
            onOpenForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'payroll' && (
          <Payroll
            records={payrollRecords}
            setRecords={setPayrollRecords}
            settings={settings}
            onPrintSlip={(rec) => setSelectedPayslipRecord(rec)}
          />
        )}

        {activeTab === 'form' && (
          <Form
            employees={employees}
            setEmployees={setEmployees}
            settings={settings}
          />
        )}

        {activeTab === 'idcard' && (
          <IDCard
            employees={employees}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            employees={employees}
            setEmployees={setEmployees}
            payrollRecords={payrollRecords}
            setPayrollRecords={setPayrollRecords}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Salary Slip Print Modal */}
      {selectedPayslipRecord && (
        <SalarySlipModal
          record={selectedPayslipRecord}
          settings={settings}
          onClose={() => setSelectedPayslipRecord(null)}
        />
      )}
    </div>
  );
}
