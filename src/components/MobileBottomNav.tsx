import React from 'react';
import { LayoutDashboard, Receipt, UserPlus, IdCard, Settings as SettingsIcon } from 'lucide-react';
import { ActiveTab, PortalUser } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser?: PortalUser | null;
  employeeCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  employeeCount,
}) => {
  const allNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payroll' as ActiveTab, label: 'Payroll', icon: Receipt },
    { id: 'form' as ActiveTab, label: 'Add Form', icon: UserPlus },
    { id: 'idcard' as ActiveTab, label: 'ID Cards', icon: IdCard },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: SettingsIcon },
  ];

  const navItems = currentUser && currentUser.allowedTabs
    ? allNavItems.filter((item) => currentUser.allowedTabs.includes(item.id))
    : allNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-2 py-1.5 print:hidden">
      <nav className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-[60px] transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 -translate-y-1'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className={`text-[10px] tracking-tight leading-none font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-white absolute -bottom-0.5 shadow"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
