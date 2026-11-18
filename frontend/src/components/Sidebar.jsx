import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  Sliders,
  CheckCircle2,
  Activity,
  BarChart3,
  Bell,
  Users,
  Eye,
  X,
  MapPin,
  LogIn,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, activeTab, onSelectTab }) {
  const { user } = useAuth();
  const role = user?.role || 'planner';

  const navItems = [];

  if (role === 'citizen') {
    navItems.push({ id: 'citizen_portal', label: 'Public Water Portal', icon: Eye });
    navItems.push({ id: 'alerts', label: 'Public Water Alerts', icon: Bell });
  } else {
    // Planner and Admin have access to the full decision-support suite
    navItems.push({ id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard });
    navItems.push({ id: 'forecast', label: 'Prophet Early Warning', icon: TrendingUp });
    navItems.push({ id: 'risk_shap', label: 'Risk & SHAP Explainability', icon: Brain });
    navItems.push({ id: 'simulator', label: 'What-If Crisis Simulator', icon: Sliders });
    navItems.push({ id: 'action_plans', label: 'Conservation Engine', icon: CheckCircle2 });
    navItems.push({ id: 'recovery', label: 'Recovery Tracker', icon: Activity });
    navItems.push({ id: 'eda', label: '14-Year Climate EDA', icon: BarChart3 });
    navItems.push({ id: 'alerts', label: 'Crisis Alerts', icon: Bell });

    if (role === 'admin') {
      navItems.push({ id: 'admin_panel', label: 'Admin User Management', icon: Users });
    }
  }

  // Common Auth / 3D Login Page entry
  navItems.push({ id: 'login', label: '3D Login & Auth Portal', icon: LogIn });

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white/95 border-r border-sky-100">
      <div className="space-y-5">
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Navigation Menu</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Static Logo in Sidebar */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <img
            src="/aquashield-logo.png"
            alt="AquaShield Logo"
            className="w-7 h-7 rounded-lg object-contain drop-shadow-xs shrink-0"
          />
          <div className="truncate">
            <span className="text-xs font-black text-slate-900 tracking-tight">Aqua<span className="text-sky-600">Shield</span></span>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Official Platform Logo</p>
          </div>
        </div>

        {/* Location & Station Status Pill */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-sky-800 font-bold">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">Mangaluru, Karnataka</span>
          </div>
          <p className="text-[10px] text-slate-500">12.66° N, 75.40° E • Dakshina Kannada</p>
          <div className="pt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-semibold text-emerald-700">Telemetry Online</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-600 hover:bg-sky-50/80 hover:text-sky-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* College & Project Footer Attribution */}
      <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700">St Joseph Engineering College</p>
        <p>Dept. of Computer Applications</p>
        <p className="text-sky-600 font-medium">Meghashree (4SO25MC064)</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-Over Backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
