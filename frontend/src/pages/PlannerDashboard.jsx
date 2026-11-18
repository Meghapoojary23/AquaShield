import React from 'react';
import { Droplets, Thermometer, ArrowDownRight, Compass, ShieldAlert, Sparkles, ChevronRight, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ForecastChart from '../components/ForecastChart';
import ShapWaterfall from '../components/ShapWaterfall';

export default function PlannerDashboard({ summary, currentRisk, forecast, onSelectTab }) {
  const latest = summary?.latest_observation || {};
  const rootCauses = currentRisk?.primary_root_causes || [];
  const plans = currentRisk?.conservation_plans || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Risk State */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                Region: Dakshina Kannada / Mangaluru
              </span>
              <span className="text-xs text-sky-200">Observed: {latest.date || 'Latest'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Water Crisis Early Warning Engine
            </h1>
            <p className="text-sm text-sky-100/90 leading-relaxed">
              Evaluating multi-source hydrological indicators across 14 years of telemetry. Advance warning indicates elevated seasonal stress.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shrink-0 flex flex-col items-center md:items-end justify-center space-y-2">
            <p className="text-xs uppercase tracking-wider text-sky-200 font-semibold">Active Early Warning Level</p>
            <RiskBadge level={latest.risk_level || currentRisk?.predicted_risk || 'High'} size="lg" />
            <p className="text-xs text-sky-200/90">
              Stress Score: <strong className="text-white text-sm font-mono">{latest.water_stress_score || 72.6}</strong> / 100
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Water Stress Score"
          value={latest.water_stress_score || 72.6}
          unit="/ 100"
          icon={Droplets}
          progressPct={latest.water_stress_score || 72.6}
          subtitle={`Percentile Rank: ${latest.water_stress_score > 74 ? 'P75 (Critical)' : 'P50-P75 (High)'}`}
          badgeText={latest.risk_level || 'High'}
          badgeColor="rose"
        />

        <StatCard
          title="30-Day Rainfall"
          value={latest.precip_30d || 73.0}
          unit="mm"
          icon={Compass}
          subtitle="Cumulative rolling precipitation"
          badgeText="Deficit Zone"
          badgeColor="amber"
        />

        <StatCard
          title="Water Table Depth"
          value={latest.gw_level_mbgl || 10.4}
          unit="m bgl"
          icon={ArrowDownRight}
          subtitle="Aquifer drawdown level"
          badgeText="Below Normal"
          badgeColor="amber"
        />

        <StatCard
          title="Mean Temperature"
          value={latest.temp || 27.8}
          unit="°C"
          icon={Thermometer}
          subtitle={`High: ${latest.tempmax || 33.6}°C | Low: ${latest.tempmin || 23.0}°C`}
          badgeText="Thermal Peak"
          badgeColor="sky"
        />
      </div>

      {/* Main Grid: Forecast on Left, SHAP on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Prophet Predictive Horizon (30–90 Days)</h2>
              <p className="text-xs text-slate-500">Additive time-series forecast with 80% confidence bands</p>
            </div>
            <button
              onClick={() => onSelectTab('forecast')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Detailed View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ForecastChart timeline={forecast?.timeline || []} metrics={forecast?.metrics || {}} />
        </div>

        {/* SHAP Explainability Panel (1 Col) */}
        <div className="bg-white/90 backdrop-blur-sm border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Explainable AI (SHAP)</h2>
              <p className="text-xs text-slate-500">Local feature contribution breakdown</p>
            </div>
            <button
              onClick={() => onSelectTab('risk_shap')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ShapWaterfall contributions={currentRisk?.shap_contributions || []} />

          {/* Primary Root Causes */}
          {rootCauses.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Identified Root Drivers</span>
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                {rootCauses.map((rc, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-sky-50/60 border border-sky-100/80">
                    {rc.driver}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conservation Action Plans & Recovery Tracker Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Action Plans */}
        <div className="bg-white/90 backdrop-blur-sm border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Recommended Conservation Actions</h3>
            </div>
            <button
              onClick={() => onSelectTab('action_plans')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {plans.slice(0, 2).map((plan) => (
              <div key={plan.id} className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    {plan.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{plan.sector}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{plan.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closed-Loop Recovery Tracker Callout */}
        <div className="bg-gradient-to-br from-white to-sky-50/60 border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Closed-Loop Recovery Tracker</h3>
              </div>
              <button
                onClick={() => onSelectTab('recovery')}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
              >
                <span>Track Outcomes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Unlike static prediction systems, AquaShield tracks the <strong>real-world effectiveness</strong> of implemented conservation measures.
            </p>
            <div className="mt-4 p-3 bg-white rounded-xl border border-sky-100 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Active Interventions:</span>
                <span className="font-bold text-sky-700">2 In Progress</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Average Stress Reduction:</span>
                <span className="font-bold text-emerald-600">-18.3 Points</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('recovery')}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Recovery Tracker Module</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
