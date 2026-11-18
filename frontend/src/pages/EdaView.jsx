import React, { useState, useEffect } from 'react';
import { BarChart3, CloudRain, Sun, Calendar, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { api } from '../api';

export default function EdaView() {
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEdaStats()
      .then(res => setEdaData(res))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const patterns = edaData?.monthly_patterns || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Exploratory Data Analysis</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">14-Year Climate & Monsoon Patterns (2010–2023)</h1>
        <p className="text-xs text-slate-500 max-w-xl mt-1">
          Historical analysis across 5,113 observations capturing Mangaluru's heavy Southwest Monsoon cycles and intense pre-monsoon summer aridity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Average Rainfall (Bar Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Average Monthly Rainfall (mm)</h2>
              <p className="text-xs text-slate-500">Highlighting June–August monsoon deluge vs Jan–April drought</p>
            </div>
            <CloudRain className="w-4 h-4 text-sky-600" />
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patterns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="avg_monthly_rain" fill="#0284c7" radius={[6, 6, 0, 0]} name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Water Stress Trends (Line Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mean Temperature & Stress Cycles</h2>
              <p className="text-xs text-slate-500">March–May summer heatwave triggers peak Water Stress Scores</p>
            </div>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patterns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="avg_stress_score" stroke="#ef4444" strokeWidth={2.2} name="Water Stress Score" />
                <Line type="monotone" dataKey="avg_temp" stroke="#f59e0b" strokeWidth={2} name="Mean Temp (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
