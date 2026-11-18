import React, { useState } from 'react';
import { Activity, Plus, TrendingDown, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function RecoveryTrackerView({ interventions = [], onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Groundwater Recharge',
    location: 'Mangaluru Urban Belt',
    start_date: new Date().toISOString().split('T')[0],
    target_metric: 'Water Stress Score Reduction',
    baseline_stress: 74.5,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Groundwater Recharge',
    'Rainwater Harvesting',
    'Municipal Rationing',
    'Leakage Detection & Repair',
    'Lake & Catchment Desiltation',
    'Industrial Water Recycling'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addIntervention(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Groundwater Recharge',
        location: 'Mangaluru Urban Belt',
        start_date: new Date().toISOString().split('T')[0],
        target_metric: 'Water Stress Score Reduction',
        baseline_stress: 74.5,
        description: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error adding intervention: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateRecovery = async (item) => {
    const current = item.current_stress || item.baseline_stress;
    const newStress = Math.max(30.0, current - 4.5);
    const newStatus = newStress < 60 ? 'IMPROVED' : 'IN_PROGRESS';
    try {
      await api.updateInterventionStatus(item.id, newStatus, newStress);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Closed-Loop Feedback System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Conservation Recovery Tracker</h1>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Log conservation interventions and empirically track post-action hydrological recovery curves to close the loop between prediction and outcome.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Intervention</span>
        </button>
      </div>

      {/* Interventions Table / Cards */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Active & Historical Interventions ({interventions.length})</h2>
          <span className="text-xs text-slate-400">Comparing Baseline vs Observed Trends</span>
        </div>

        <div className="divide-y divide-slate-100">
          {interventions.map((item) => {
            const base = item.baseline_stress || 75.0;
            const current = item.current_stress || base;
            const reduction = Math.max(0, base - current);
            const pct = Math.min(100, Math.round((reduction / base) * 100));

            return (
              <div key={item.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                      <span className="text-xs text-slate-400">• Started: {item.start_date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'IMPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleSimulateRecovery(item)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 transition-colors"
                      title="Simulate observation of 30-day post-intervention data"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Log +30d Recovery</span>
                    </button>
                  </div>
                </div>

                {/* Progress Comparison */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400">Baseline Stress:</span>
                      <p className="font-mono font-bold text-slate-800">{base.toFixed(1)} / 100</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Current Stress:</span>
                      <p className="font-mono font-bold text-sky-700">{current.toFixed(1)} / 100</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Stress Reduction:</span>
                      <p className="font-mono font-bold text-emerald-600">-{reduction.toFixed(1)} pts ({pct}%)</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Recovery Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding new intervention */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record New Conservation Measure</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Project / Measure Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone 4 Rainwater Percolation Tanks"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Sector Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Location / Ward</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Baseline Stress Score (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.baseline_stress}
                    onChange={(e) => setFormData({ ...formData, baseline_stress: parseFloat(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Description of Intervention Steps</label>
                <textarea
                  rows="3"
                  placeholder="Outline key measures, target population, and expected recovery metrics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
