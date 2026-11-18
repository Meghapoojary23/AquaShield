import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, Sparkles } from 'lucide-react';
import RiskBadge from './RiskBadge';
import ShapWaterfall from './ShapWaterfall';

export default function SimulatorCard({ onSimulate, isSimulating, simulationResult }) {
  const [params, setParams] = useState({
    precip_30d: 8.5,
    temp_30d_mean: 32.0,
    gw_level_mbgl: 12.2,
    consecutive_dry_days: 24,
    humidity: 55
  });

  const handleSlider = (field, val) => {
    setParams(prev => ({ ...prev, [field]: parseFloat(val) }));
  };

  const handleRun = () => {
    onSimulate(params);
  };

  const handleReset = () => {
    const defaults = {
      precip_30d: 45.0,
      temp_30d_mean: 28.5,
      gw_level_mbgl: 7.5,
      consecutive_dry_days: 5,
      humidity: 75
    };
    setParams(defaults);
    onSimulate(defaults);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-sky-100 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-200/60">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interactive What-If Crisis Simulator</h3>
            <p className="text-xs text-slate-500">Simulate climate shocks & observe model reactions in real time</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          title="Reset to seasonal average"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders Column */}
        <div className="space-y-4">
          {/* Rainfall */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">30-Day Rainfall Accumulation</span>
              <span className="font-mono text-sky-600 font-bold">{params.precip_30d} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              step="1"
              value={params.precip_30d}
              onChange={(e) => handleSlider('precip_30d', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0 mm (Severe Drought)</span>
              <span>250 mm (Monsoon Surplus)</span>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Mean Ambient Temperature</span>
              <span className="font-mono text-sky-600 font-bold">{params.temp_30d_mean} °C</span>
            </div>
            <input
              type="range"
              min="20"
              max="40"
              step="0.5"
              value={params.temp_30d_mean}
              onChange={(e) => handleSlider('temp_30d_mean', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>20 °C (Mild)</span>
              <span>40 °C (Heatwave)</span>
            </div>
          </div>

          {/* Water Table Depth */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Water Table Drawdown Depth</span>
              <span className="font-mono text-sky-600 font-bold">{params.gw_level_mbgl} m</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="0.1"
              value={params.gw_level_mbgl}
              onChange={(e) => handleSlider('gw_level_mbgl', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>3 m (Shallow Aquifer)</span>
              <span>15 m (Deep Aquifer Depletion)</span>
            </div>
          </div>

          {/* Consecutive Dry Days */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Prolonged Dry Spell</span>
              <span className="font-mono text-sky-600 font-bold">{params.consecutive_dry_days} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={params.consecutive_dry_days}
              onChange={(e) => handleSlider('consecutive_dry_days', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0 days</span>
              <span>60 days without rain</span>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <span>Simulating...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Real-Time AI Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Live Simulation Output Column */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col justify-between space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Simulated Outcome</p>
            {simulationResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Predicted Risk:</span>
                  <RiskBadge level={simulationResult.predicted_risk} size="lg" />
                </div>

                {simulationResult.class_probabilities && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-semibold">Random Forest Class Probabilities:</p>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                      {Object.entries(simulationResult.class_probabilities).map(([cls, prob]) => (
                        <div key={cls} className="bg-white p-1 rounded-md border border-slate-200/80">
                          <p className="text-slate-400">{cls}</p>
                          <p className="font-bold text-slate-800">{prob}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-700 mb-1.5">Local SHAP Attribution:</p>
                  <ShapWaterfall contributions={simulationResult.shap_contributions} />
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                <Sparkles className="w-8 h-8 text-sky-400/60 mb-2 animate-bounce" />
                <span>Adjust climate sliders and click "Run Real-Time AI Simulation"</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
