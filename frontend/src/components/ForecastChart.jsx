import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export default function ForecastChart({ timeline = [], metrics = {} }) {
  const [viewMode, setViewMode] = useState('all'); // 'all', 'forecast_only', 'historical_only'

  if (!timeline || timeline.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading forecast data...</div>;
  }

  // Filter or downsample timeline for smooth rendering
  let displayData = timeline;
  if (viewMode === 'forecast_only') {
    displayData = timeline.filter(d => d.is_forecast);
  } else if (viewMode === 'historical_only') {
    displayData = timeline.filter(d => !d.is_forecast);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0]?.payload || {};

    return (
      <div className="bg-white/95 backdrop-blur-md text-slate-800 p-3.5 rounded-2xl shadow-xl border border-sky-200 text-xs space-y-1.5 z-50">
        <p className="font-bold text-sky-700 border-b border-sky-100 pb-1">{label}</p>
        {item.is_forecast ? (
          <>
            <p className="text-slate-700 flex justify-between gap-4">
              <span>Prophet Forecast:</span>
              <span className="font-black text-sky-600">{item.forecast_score} / 100</span>
            </p>
            <p className="text-slate-500 flex justify-between gap-4">
              <span>80% Confidence Interval:</span>
              <span className="font-medium text-slate-600">{item.forecast_lower} – {item.forecast_upper}</span>
            </p>
            <p className="text-amber-700 flex justify-between gap-4">
              <span>Risk Category:</span>
              <span className="font-bold">{item.risk_level}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-700 flex justify-between gap-4">
              <span>Observed Stress:</span>
              <span className="font-black text-sky-600">{item.historical_score} / 100</span>
            </p>
            {item.temp && <p className="text-slate-500">Temp: {item.temp}°C | Rain: {item.precip}mm</p>}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls & Metrics Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setViewMode('forecast_only')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'forecast_only'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            90-Day Forecast Only
          </button>
          <button
            onClick={() => setViewMode('historical_only')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'historical_only'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Recent Historical
          </button>
        </div>

        {metrics && metrics.mae !== undefined && (
          <div className="flex items-center gap-3 text-xs bg-sky-50/70 border border-sky-200/60 px-3 py-1 rounded-xl text-sky-800">
            <span>Prophet MAE: <strong className="font-mono">{metrics.mae}</strong></span>
            <span>•</span>
            <span>RMSE: <strong className="font-mono">{metrics.rmse}</strong></span>
            <span>•</span>
            <span>MAPE: <strong className="font-mono">{metrics.mape}%</strong></span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              interval="preserveStartEnd"
              tickFormatter={(val) => {
                if (!val) return '';
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />

            {/* Threshold References */}
            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical (≥75)', fill: '#ef4444', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={65} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'High (≥65)', fill: '#f97316', fontSize: 10, position: 'right' }} />

            {/* Confidence Interval Upper and Lower */}
            <Area
              type="monotone"
              dataKey="forecast_upper"
              stroke="transparent"
              fill="url(#forecastBand)"
              name="Uncertainty Range (80%)"
            />

            {/* Historical Score Line */}
            <Line
              type="monotone"
              dataKey="historical_score"
              stroke="#0284c7"
              strokeWidth={2.2}
              dot={false}
              name="Historical Stress"
            />

            {/* Future Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecast_score"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
              name="Prophet Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
