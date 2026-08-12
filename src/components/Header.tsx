import React from 'react';
import { LayoutDashboard, Receipt, UserPlus, IdCard, Settings as SettingsIcon, Building2, Calendar, FileSpreadsheet, UserCheck, LogOut } from 'lucide-react';
import { ActiveTab, CompanySettings, PortalUser } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: CompanySettings;
  employeeCount: number;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  currentUser?: PortalUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  employeeCount,
  selectedMonth,
  setSelectedMonth,
  currentUser,
  onLogout,
}) => {
  const allNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payroll' as ActiveTab, label: 'Payroll & Slips', icon: Receipt },
    { id: 'form' as ActiveTab, label: 'Employee Form & Docs', icon: UserPlus },
    { id: 'idcard' as ActiveTab, label: 'ID Cards', icon: IdCard },
    { id: 'settings' as ActiveTab, label: 'Settings & Users', icon: SettingsIcon },
  ];

  // Filter navigation tabs based on logged in user permissions
  const navItems = currentUser && currentUser.allowedTabs
    ? allNavItems.filter((item) => currentUser.allowedTabs.includes(item.id))
    : allNavItems;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md print:hidden">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center font-bold text-lg shadow-lg text-white overflow-hidden shrink-0">
            {settings?.companyLogo ? (
              <img src={settings.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              <Building2 className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              {settings?.companyName || 'PARISHRAM ENTERPRISES'}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {settings?.companySite || 'Contract Labour Agency'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {settings?.companySubTitle || 'Manpower Supply & Contractor'}
            </p>
          </div>
        </div>

        {/* Quick Month & Employee Stats + User Logout */}
        <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Payroll Cycle:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Active Staff: <strong className="text-white">{employeeCount}</strong></span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800/60 text-blue-200">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold block text-white">{currentUser.fullName}</span>
                <span className="text-[9px] text-blue-300">{currentUser.role}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="ml-1 p-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-md transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 backdrop-blur border-t border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

