import React, { useState } from 'react';
import { 
  LayoutDashboard, Receipt, History as HistoryIcon, UserPlus, IdCard, 
  Settings as SettingsIcon, Building2, Calendar, FileSpreadsheet, 
  UserCheck, LogOut, Menu, X, ShieldCheck
} from 'lucide-react';
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const allNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payroll' as ActiveTab, label: 'Payroll & Slips', icon: Receipt },
    { id: 'history' as ActiveTab, label: 'History & Snapshots', icon: HistoryIcon },
    { id: 'form' as ActiveTab, label: 'Employee Form & Docs', icon: UserPlus },
    { id: 'idcard' as ActiveTab, label: 'ID Cards', icon: IdCard },
    { id: 'settings' as ActiveTab, label: 'Settings & Users', icon: SettingsIcon },
  ];

  // Filter navigation tabs based on logged in user permissions
  const navItems = currentUser && currentUser.allowedTabs
    ? allNavItems.filter((item) => currentUser.allowedTabs.includes(item.id))
    : allNavItems;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR MENU (Visible on lg: screens and larger) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-slate-900 text-white border-r border-slate-800 shrink-0 h-screen sticky top-0 z-40 p-4 justify-between shadow-2xl print:hidden">
        <div className="space-y-6">
          {/* Company Logo & Branding */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center font-bold text-lg shadow text-white overflow-hidden shrink-0">
                {settings?.companyLogo ? (
                  <img src={settings.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain rounded-lg" />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-black tracking-tight text-white truncate">
                  {settings?.companyName || 'PARISHRAM ENTERPRISES'}
                </h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase truncate">
                  {settings?.companySite || 'Contract Labour Agency'}
                </p>
              </div>
            </div>
          </div>

          {/* Payroll Cycle Month Selector */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Payroll Cycle Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'form' && employeeCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {employeeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info: User Profile & Firebase Status */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-2 text-[10px] text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Firebase Cloud Synced
            </span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>

          {currentUser && (
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-white block truncate">{currentUser.fullName}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{currentUser.role}</span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE TOP HEADER BAR (Visible on screens smaller than lg) */}
      <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md print:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center font-bold text-sm shadow text-white overflow-hidden shrink-0">
              {settings?.companyLogo ? (
                <img src={settings.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain rounded-lg" />
              ) : (
                <Building2 className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-white leading-tight truncate max-w-[150px] sm:max-w-xs">
                {settings?.companyName || 'PARISHRAM ENTERPRISES'}
              </h1>
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                {settings?.companySite || 'Contract Site'}
              </span>
            </div>
          </div>

          {/* Quick Month Picker & Mobile Hamburger Button */}
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
            />

            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              id="btn-mobile-menu-toggle"
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow cursor-pointer transition-all"
            >
              {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn print:hidden">
          <div className="bg-slate-900 text-white w-4/5 max-w-xs h-full p-5 flex flex-col justify-between shadow-2xl border-l border-slate-800 overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-white">Menu Navigation</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-300" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer User Info */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              {currentUser && (
                <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-white">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-400">{currentUser.role}</span>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-2 bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
