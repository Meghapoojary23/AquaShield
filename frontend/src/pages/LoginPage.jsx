import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AquaShield3DLogo from '../components/AquaShield3DLogo';
import { Shield, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithCredentials, switchRole, DEMO_ACCOUNTS } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    switchRole(roleKey);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Branding Area with 3D Logo */}
        <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          {/* Top Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase text-sky-200 border border-white/10">
              Decision Support System
            </span>
            <span className="text-[11px] text-sky-200">SJEC MCA 2026–27</span>
          </div>

          {/* Center 3D Interactive Droplet Logo */}
          <div className="relative z-10 py-6 flex flex-col items-center text-center">
            <AquaShield3DLogo size="md" />

            <div className="mt-2 space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                Aqua<span className="text-cyan-300">Shield</span>
              </h1>
              <p className="text-xs font-semibold text-sky-200 tracking-wider uppercase">
                AI-Powered Water Crisis Intelligence
              </p>
            </div>
          </div>

          {/* Feature Badges Footer */}
          <div className="relative z-10 space-y-2 pt-4 border-t border-white/10 text-xs text-sky-100/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Prophet Additive Time-Series Forecasting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Explainable AI (SHAP) Root Cause Diagnostics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Closed-Loop Post-Intervention Recovery Tracker</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Area */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Access Portal</h2>
            <p className="text-xs text-slate-500">Sign in with credentials or choose a quick demo role below.</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. planner@mangaluru.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Logins for Viva & Evaluation */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>One-Click Demo Roles (For Evaluation)</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleQuickDemo(acc.role)}
                  className="w-full text-left p-2.5 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-300 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                      {acc.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{acc.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-600 bg-white px-2 py-0.5 rounded-full border border-sky-200 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
