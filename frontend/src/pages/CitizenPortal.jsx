import React from 'react';
import { Droplet, Bell, Sun, CloudRain, CheckCircle, ShieldCheck, HeartHandshake, Info } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function CitizenPortal({ summary, alerts }) {
  const latest = summary?.latest_observation || {};

  const citizenTips = [
    {
      title: "Rooftop Rainwater Collection",
      desc: "Ensure your rooftop catchment mesh is clear. A single unseasonal shower can recharge your borewell or supply 500 liters for cleaning.",
      tag: "High Impact"
    },
    {
      title: "Household Tap Aerators",
      desc: "Installing screw-on sink aerators reduces kitchen and bathroom flow from 12 L/min to 4 L/min without losing pressure.",
      tag: "Easy Fix"
    },
    {
      title: "Greywater Re-use for Gardens",
      desc: "Divert water from laundry rinse cycles or AC condenser runoff directly to garden soil instead of using freshwater.",
      tag: "Conservation"
    },
    {
      title: "Report Underground Street Leaks",
      desc: "Spot water seeping through road asphalt? Report it to the municipal helpline to prevent thousands of gallons in transit loss.",
      tag: "Community"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Big Friendly Hero Card */}
      <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-600/20 text-center space-y-4">
        <div className="inline-flex p-1.5 rounded-3xl bg-white/20 backdrop-blur-md shadow-lg">
          <img
            src="/aquashield-logo.png"
            alt="AquaShield Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl drop-shadow-md"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black">Mangaluru Public Water Portal</h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-lg mx-auto">
            Live community water advisory powered by AquaShield AI. Stay informed about regional water levels and conservation guidance.
          </p>
        </div>

        {/* Big Status Badge */}
        <div className="bg-white/95 text-slate-900 rounded-2xl p-5 max-w-md mx-auto shadow-lg space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Water Stress Status</p>
          <div className="flex justify-center">
            <RiskBadge level={latest.risk_level || 'High'} size="lg" />
          </div>
          <p className="text-xs text-slate-600">
            Regional Stress Index: <strong>{latest.water_stress_score || 72.6} / 100</strong> (Precautionary municipal conservation in effect).
          </p>
        </div>
      </div>

      {/* Active Public Alerts */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-600">
          <Bell className="w-4 h-4" />
          <h2 className="text-sm font-bold text-slate-900">Active Public Water Advisories</h2>
        </div>
        <div className="space-y-2">
          {alerts && alerts.length > 0 ? (
            alerts.filter(a => a.status === 'ACTIVE').map(alert => (
              <div key={alert.id} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-800">{alert.title}</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{alert.severity}</span>
                </div>
                <p className="text-slate-600">{alert.message}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No emergency restrictions active today.</p>
          )}
        </div>
      </div>

      {/* 4 Weather / Environmental Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-sky-100 text-center space-y-1">
          <Sun className="w-5 h-5 text-amber-500 mx-auto" />
          <p className="text-xs text-slate-500">Current Temp</p>
          <p className="text-base font-bold text-slate-900">{latest.temp || 27.8} °C</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-100 text-center space-y-1">
          <CloudRain className="w-5 h-5 text-sky-500 mx-auto" />
          <p className="text-xs text-slate-500">Recent Rainfall</p>
          <p className="text-base font-bold text-slate-900">{latest.precip_30d || 73.0} mm</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-100 text-center space-y-1">
          <Droplet className="w-5 h-5 text-cyan-500 mx-auto" />
          <p className="text-xs text-slate-500">Relative Humidity</p>
          <p className="text-base font-bold text-slate-900">{latest.humidity || 68}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-100 text-center space-y-1">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
          <p className="text-xs text-slate-500">Water Quality</p>
          <p className="text-base font-bold text-emerald-600">Safe Potable</p>
        </div>
      </div>

      {/* Household Conservation Guidelines */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">What Citizens Can Do Right Now</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {citizenTips.map((tip, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">{tip.title}</h3>
                <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{tip.tag}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
