import React, { useState } from 'react';
import { Droplet, Download, Menu, X, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Navbar({ onToggleSidebar, activeTab }) {
  const { user, switchRole, DEMO_ACCOUNTS } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
                  Aqua<span className="text-sky-600">Shield</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100/80 text-sky-700 font-bold ml-1">AI-DSS</span>
                </span>
                <p className="hidden sm:block text-[10px] font-medium text-slate-400">Early Warning & Conservation Decision System</p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Role Switcher (Super Useful for Viva & Evaluators!) */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-xs font-semibold text-sky-800 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span className="capitalize">{user?.role || 'Role'} View</span>
                <ChevronDown className="w-3 h-3 text-sky-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-sky-100 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch User Role
                  </div>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      onClick={() => {
                        switchRole(acc.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-sky-50 transition-colors ${
                        user?.role === acc.role ? 'bg-sky-50 font-bold text-sky-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {user?.role === acc.role && <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Official Report Download Button */}
            <a
              href={api.getReportDownloadUrl()}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-bold shadow-sm shadow-sky-600/20 hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </a>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
