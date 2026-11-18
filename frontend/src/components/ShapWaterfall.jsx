import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export default function ShapWaterfall({ contributions = [] }) {
  if (!contributions || contributions.length === 0) {
    return <div className="text-sm text-slate-400 italic">No SHAP explanations available.</div>;
  }

  // Friendly names for feature keys
  const friendlyNames = {
    precip_30d: '30-Day Rainfall Deficit',
    temp_30d_mean: 'Mean Monthly Temperature',
    gw_level_mbgl: 'Water Table Drawdown Depth',
    consecutive_dry_days: 'Prolonged Dry Spell Days',
    humidity: 'Atmospheric Aridity / Low Humidity',
    evap_proxy: 'Evapotranspiration Demand',
    solarradiation: 'Solar Radiation Load'
  };

  const maxAbs = Math.max(...contributions.map(c => Math.abs(c.shap_value)), 0.1);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
        <span className="font-semibold uppercase tracking-wider">Predictor Feature</span>
        <span className="font-semibold uppercase tracking-wider">SHAP Impact on Stress</span>
      </div>

      {contributions.map((item, idx) => {
        const isPushHigher = item.shap_value > 0;
        const widthPct = Math.min(100, Math.max(12, (Math.abs(item.shap_value) / maxAbs) * 100));
        const featureLabel = friendlyNames[item.feature] || item.feature;

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 truncate max-w-[200px] sm:max-w-[280px]">
                {featureLabel}
              </span>
              <div className="flex items-center gap-1 font-mono font-bold">
                {isPushHigher ? (
                  <span className="text-rose-600 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{item.shap_value.toFixed(3)}
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {item.shap_value.toFixed(3)}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isPushHigher
                    ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>Red bars drive crisis probability higher; Green bars stabilize water reserves.</span>
      </div>
    </div>
  );
}
