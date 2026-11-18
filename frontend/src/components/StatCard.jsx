import React from 'react';

export default function StatCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = 'sky',
  progressPct
}) {
  const badgeStyles = {
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-sky-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100/60 text-sky-600 border border-sky-200/50 shadow-sm group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {progressPct !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || badgeText) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100/80">
          {subtitle && <span className="text-slate-500 truncate max-w-[70%]">{subtitle}</span>}
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${badgeStyles[badgeColor] || badgeStyles.sky}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
