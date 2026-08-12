import React, { useState } from 'react';
import { Lock, User, ShieldCheck, LogIn, Key, Sparkles, Building2 } from 'lucide-react';
import { PortalUser, CompanySettings } from '../types';

interface LoginModalProps {
  users: PortalUser[];
  onLogin: (user: PortalUser) => void;
  settings?: CompanySettings;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    const matched = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (matched) {
      onLogin(matched);
    } else {
      setErrorMsg('Invalid User ID or Password. Please check credentials.');
    }
  };

  const handleQuickLogin = (u: PortalUser) => {
    setUsername(u.username);
    setPassword(u.password);
    onLogin(u);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Brand Header */}
        <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl"></div>

          {settings?.companyLogo ? (
            <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20 flex items-center justify-center shadow-lg">
              <img src={settings.companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 mx-auto mb-3 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 text-white">
              <Building2 className="w-7 h-7" />
            </div>
          )}

          <h1 className="text-xl font-extrabold tracking-tight uppercase text-white">
            {settings?.companyName || 'PARISHRAM ENTERPRISES'}
          </h1>
          <p className="text-xs text-blue-300 font-medium mt-1">
            Human Resources & Multi-Contract Payroll Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your assigned User ID and Password to access your permitted modules.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl text-center animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                User ID / Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or hr_staff"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Portal
            </button>
          </form>

          {/* Quick Access Account Selector for Demo */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Demo Login Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="px-2 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-bold rounded-xl border border-slate-200/80 transition-all text-center cursor-pointer truncate"
                  title={`${u.fullName} (${u.username} / ${u.password})`}
                >
                  <div className="truncate font-extrabold">{u.username}</div>
                  <div className="text-[9px] text-slate-500 font-normal truncate">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
