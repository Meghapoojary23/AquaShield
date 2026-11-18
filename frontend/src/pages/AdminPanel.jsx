import React, { useState, useEffect } from 'react';
import { Users, Database, Shield, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (e) {
      alert('Error updating role: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
        <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Governance & Administration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Administrator Console</h1>
        <p className="text-xs text-slate-500 max-w-xl mt-1">
          Manage system users, audit telemetry datasets, and verify machine learning model registry status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Registered Platform Users</h2>
            </div>
            <button
              onClick={fetchUsers}
              className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'planner'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="p-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="planner">Planner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dataset & System Diagnostics (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Dataset Health Audit</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>data_2014_23.csv</span>
                  <span className="text-emerald-600 font-bold">Validated</span>
                </div>
                <p className="text-[11px] text-slate-400">4,383 rows (2010–2021) • 39 parameters</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>data_22-23.csv</span>
                  <span className="text-emerald-600 font-bold">Validated</span>
                </div>
                <p className="text-[11px] text-slate-400">730 rows (2022–2023) • 33 parameters</p>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
                <div className="flex justify-between font-bold text-sky-900">
                  <span>Merged Dataset</span>
                  <span className="font-mono">5,113 Records</span>
                </div>
                <p className="text-[11px] text-sky-700">14 consecutive years • Zero missing dates</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>AI Service Registry</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Prophet Forecasting Engine:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Trained
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Random Forest Classifier:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 96.8% Acc
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>SHAP Explainability Tree:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>SQLite Database:</span>
                <span className="font-semibold text-slate-800 font-mono">aquashield.db</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
