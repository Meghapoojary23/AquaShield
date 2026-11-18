import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PlannerDashboard from './pages/PlannerDashboard';
import CitizenPortal from './pages/CitizenPortal';
import AdminPanel from './pages/AdminPanel';
import RecoveryTrackerView from './pages/RecoveryTrackerView';
import EdaView from './pages/EdaView';
import LoginPage from './pages/LoginPage';
import ForecastChart from './components/ForecastChart';
import ShapWaterfall from './components/ShapWaterfall';
import SimulatorCard from './components/SimulatorCard';
import RiskBadge from './components/RiskBadge';
import { api } from './api';
import { Brain, Sparkles, CheckCircle2, Bell, RefreshCw } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global State
  const [summary, setSummary] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const fetchAllData = async () => {
    try {
      const [sumRes, riskRes, foreRes, intRes, alRes, metRes] = await Promise.all([
        api.getDataSummary().catch(() => null),
        api.getCurrentRisk().catch(() => null),
        api.getForecast().catch(() => null),
        api.getInterventions().catch(() => ({ interventions: [] })),
        api.getAlerts().catch(() => ({ alerts: [] })),
        api.getRiskMetrics().catch(() => null)
      ]);

      if (sumRes) setSummary(sumRes);
      if (riskRes) setCurrentRisk(riskRes);
      if (foreRes) setForecast(foreRes);
      if (intRes?.interventions) setInterventions(intRes.interventions);
      if (alRes?.alerts) setAlerts(alRes.alerts);
      if (metRes) setRiskMetrics(metRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update tab automatically when switching to Citizen role
  useEffect(() => {
    if (user?.role === 'citizen') {
      setActiveTab('citizen_portal');
    } else if (activeTab === 'citizen_portal') {
      setActiveTab('dashboard');
    }
  }, [user?.role]);

  const handleSimulate = async (params) => {
    setIsSimulating(true);
    try {
      const res = await api.simulateRisk(params);
      setSimulationResult(res);
    } catch (err) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.resolveAlert(id);
      const alRes = await api.getAlerts();
      setAlerts(alRes.alerts || []);
    } catch (e) {
      alert('Failed to resolve alert');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-sky-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* Active View Switching */}
          {activeTab === 'dashboard' && (
            <PlannerDashboard
              summary={summary}
              currentRisk={currentRisk}
              forecast={forecast}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'citizen_portal' && (
            <CitizenPortal summary={summary} alerts={alerts} />
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">Prophet Predictive Horizon</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Additive time-series model with seasonal decomposition, trend projection, and 80% confidence bands.
                  </p>
                </div>
                <button
                  onClick={() => fetchAllData()}
                  className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Projections</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <ForecastChart timeline={forecast?.timeline || []} metrics={forecast?.metrics || {}} />
              </div>
            </div>
          )}

          {activeTab === 'risk_shap' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Brain className="w-4 h-4" />
                  <span>Transparent AI Diagnostics</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Explainable AI (SHAP) & Risk Classifier</h1>
                <p className="text-xs text-slate-500 max-w-xl mt-1">
                  Quantifying individual feature attributions so decision-makers understand the underlying drivers behind assigned risk levels.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Current Observation SHAP Waterfall
                  </h2>
                  <ShapWaterfall contributions={currentRisk?.shap_contributions || []} />
                </div>

                <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Random Forest Performance Metrics
                  </h2>
                  {riskMetrics ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                          <p className="text-emerald-700 font-semibold">Test Accuracy</p>
                          <p className="text-2xl font-black text-emerald-800">{riskMetrics.accuracy}%</p>
                        </div>
                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-center">
                          <p className="text-sky-700 font-semibold">Macro F1 Score</p>
                          <p className="text-2xl font-black text-sky-800">{riskMetrics.macro_f1}%</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="font-semibold text-slate-700 mb-2">Global Feature Importance Ranking:</p>
                        <div className="space-y-1.5">
                          {Object.entries(riskMetrics.feature_importances || {}).map(([feat, imp]) => (
                            <div key={feat} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100">
                              <span className="font-mono text-slate-600">{feat}</span>
                              <span className="font-bold text-sky-700">{(imp * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Loading metrics...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <SimulatorCard
              onSimulate={handleSimulate}
              isSimulating={isSimulating}
              simulationResult={simulationResult}
            />
          )}

          {activeTab === 'action_plans' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rule-Based Decision Support</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Conservation Planning Engine</h1>
                <p className="text-xs text-slate-500 max-w-xl mt-1">
                  Synthesizing predicted risk severity and SHAP root causes into sector-specific, actionable intervention protocols.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentRisk?.conservation_plans || []).map((plan) => (
                  <div key={plan.id} className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {plan.priority}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{plan.sector}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{plan.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Targeted Recovery Impact</span>
                      <p className="text-slate-700 font-medium">{plan.expected_impact}</p>
                    </div>

                    {plan.steps && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-bold text-slate-700">Action Steps:</p>
                        <ul className="space-y-1">
                          {plan.steps.map((st, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recovery' && (
            <RecoveryTrackerView
              interventions={interventions}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'eda' && <EdaView />}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Bell className="w-4 h-4" />
                  <span>Early Warning Broadcasts</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Regional Water Alerts</h1>
                <p className="text-xs text-slate-500 max-w-xl mt-1">
                  High & Critical water scarcity notifications dispatched to authorities, utility managers, and the public.
                </p>
              </div>

              <div className="space-y-3">
                {alerts.map((al) => (
                  <div key={al.id} className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                          al.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : al.severity === 'HIGH'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {al.severity}
                        </span>
                        <span className="text-xs text-slate-400">• Status: {al.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{al.title}</h3>
                      <p className="text-xs text-slate-600">{al.message}</p>
                    </div>

                    {al.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleResolveAlert(al.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-semibold shrink-0"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admin_panel' && <AdminPanel />}

          {activeTab === 'login' && (
            <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
