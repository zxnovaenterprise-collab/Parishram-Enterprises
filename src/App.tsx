import React, { useState, useEffect } from 'react';
import { ActiveTab, CompanySettings, EmployeeForm, PayrollRecord, PortalUser } from './types';
import { initialCompanySettings, sampleEmployees, samplePayrollRecords, defaultPortalUsers } from './data/initialData';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Payroll } from './components/Payroll';
import { Form } from './components/Form';
import { IDCard } from './components/IDCard';
import { Settings } from './components/Settings';
import { SalarySlipModal } from './components/SalarySlipModal';
import { MultiPagePrintPreview } from './components/MultiPagePrintPreview';
import { LoginModal } from './components/LoginModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SqlImportModal } from './components/SqlImportModal';
import { 
  subscribeEmployees, 
  subscribePayrollRecords, 
  subscribeSettings, 
  saveBatchEmployeesToFirestore, 
  saveBatchPayrollRecordsToFirestore, 
  saveSettingsToFirestore,
  saveEmployeeToFirestore,
  savePayrollRecordToFirestore
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // SQL Import Modal state
  const [isSqlImportModalOpen, setIsSqlImportModalOpen] = useState(false);

  // Users & Authentication State
  const [users, setUsers] = useState<PortalUser[]>(() => {
    const saved = localStorage.getItem('apex_portal_users');
    return saved ? JSON.parse(saved) : defaultPortalUsers;
  });

  const [currentUser, setCurrentUser] = useState<PortalUser | null>(() => {
    const saved = localStorage.getItem('apex_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Data States
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

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubEmployees = subscribeEmployees((remoteEmployees) => {
      if (remoteEmployees && remoteEmployees.length > 0) {
        setEmployees(remoteEmployees);
      } else if (sampleEmployees.length > 0) {
        // Seed initial data to Firestore if cloud database is empty
        saveBatchEmployeesToFirestore(sampleEmployees).catch(console.error);
      }
    });

    const unsubPayroll = subscribePayrollRecords((remotePayroll) => {
      if (remotePayroll && remotePayroll.length > 0) {
        setPayrollRecords(remotePayroll);
      } else if (samplePayrollRecords.length > 0) {
        // Seed initial payroll data
        saveBatchPayrollRecordsToFirestore(samplePayrollRecords).catch(console.error);
      }
    });

    const unsubSettings = subscribeSettings((remoteSettings) => {
      if (remoteSettings && remoteSettings.companyName) {
        setSettings(remoteSettings);
      } else {
        saveSettingsToFirestore(initialCompanySettings).catch(console.error);
      }
    });

    return () => {
      unsubEmployees();
      unsubPayroll();
      unsubSettings();
    };
  }, []);

  // Modal for salary slip print preview
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);

  // Modal for 2-Page Employee Application Form & ID Card + Docs print preview
  const [previewEmployee, setPreviewEmployee] = useState<EmployeeForm | null>(null);

  // Sync state to LocalStorage as secondary cache
  useEffect(() => {
    localStorage.setItem('apex_portal_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('apex_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('apex_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_company_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('apex_employees_data', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('apex_payroll_records', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  // Login handler
  const handleLogin = (user: PortalUser) => {
    setCurrentUser(user);
    // Switch to first allowed tab if current activeTab is not permitted
    if (!user.allowedTabs.includes(activeTab)) {
      setActiveTab(user.allowedTabs[0] || 'dashboard');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Reset to initial sample dataset
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to original sample records?')) {
      setSettings(initialCompanySettings);
      setEmployees(sampleEmployees);
      setPayrollRecords(samplePayrollRecords);
      setUsers(defaultPortalUsers);
      localStorage.clear();
    }
  };

  // If user is not logged in, display the security login modal
  if (!currentUser) {
    return <LoginModal users={users} onLogin={handleLogin} settings={settings} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Header (Hidden during Print) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        employeeCount={employees.length}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area (Hidden during Print to exclude Portal UI) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8 print:hidden">
        {activeTab === 'dashboard' && currentUser.allowedTabs.includes('dashboard') && (
          <Dashboard
            payrollRecords={payrollRecords}
            employees={employees}
            settings={settings}
            setActiveTab={setActiveTab}
            onOpenForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'payroll' && currentUser.allowedTabs.includes('payroll') && (
          <Payroll
            records={payrollRecords}
            setRecords={setPayrollRecords}
            settings={settings}
            onPrintSlip={(rec) => setSelectedPayslipRecord(rec)}
            onOpenSqlImportModal={() => setIsSqlImportModalOpen(true)}
          />
        )}

        {activeTab === 'form' && currentUser.allowedTabs.includes('form') && (
          <Form
            employees={employees}
            setEmployees={setEmployees}
            settings={settings}
            onOpenPreview={(emp) => setPreviewEmployee(emp)}
            setPayrollRecords={setPayrollRecords}
            onOpenSqlImportModal={() => setIsSqlImportModalOpen(true)}
          />
        )}

        {activeTab === 'idcard' && currentUser.allowedTabs.includes('idcard') && (
          <IDCard
            employees={employees}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && currentUser.allowedTabs.includes('settings') && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            employees={employees}
            setEmployees={setEmployees}
            payrollRecords={payrollRecords}
            setPayrollRecords={setPayrollRecords}
            onResetData={handleResetData}
            users={users}
            setUsers={setUsers}
            onOpenSqlImportModal={() => setIsSqlImportModalOpen(true)}
          />
        )}
      </main>

      {/* SQL Import Modal */}
      {isSqlImportModalOpen && (
        <SqlImportModal
          onClose={() => setIsSqlImportModalOpen(false)}
          onImportSuccess={(newEmps, newPayrolls) => {
            if (newEmps.length > 0) {
              setEmployees((prev) => [...newEmps, ...prev]);
              saveBatchEmployeesToFirestore(newEmps).catch(console.error);
            }
            if (newPayrolls.length > 0) {
              setPayrollRecords((prev) => [...newPayrolls, ...prev]);
              saveBatchPayrollRecordsToFirestore(newPayrolls).catch(console.error);
            }
          }}
        />
      )}

      {/* Responsive App Bottom Tab Bar for Mobile */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        employeeCount={employees.length}
      />

      {/* 2-Page Employee Application Form & Document Print Preview Modal */}
      {previewEmployee && (
        <MultiPagePrintPreview
          employee={previewEmployee}
          settings={settings}
          onClose={() => setPreviewEmployee(null)}
        />
      )}

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
