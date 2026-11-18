import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskBadge({ level = 'Medium', size = 'md', showIcon = true }) {
  const normLevel = (level || 'Medium').toLowerCase();

  const configs = {
    low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'Low Risk',
      sub: 'Hydrological balance normal'
    },
    medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Medium Risk',
      sub: 'Moderate seasonal stress'
    },
    high: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      icon: ShieldAlert,
      label: 'High Risk',
      sub: 'Severe rainfall deficit'
    },
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-300/40 glow-aqua',
      dot: 'bg-rose-600 animate-ping',
      icon: AlertOctagon,
      label: 'Critical Crisis',
      sub: 'Emergency rationing alert'
    }
  };

  const config = configs[normLevel] || configs.medium;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-5 py-2.5 font-bold shadow-sm'
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border font-semibold transition-all ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      <span>{config.label}</span>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
    </span>
  );
}
