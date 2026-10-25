import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { AdminActivityLog } from '../../types';
import {
  Activity,
  ChevronLeft,
  Shield,
  Search,
  Calendar,
  User,
  Clock,
} from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminActivityLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.admin_name.toLowerCase().includes(search.toLowerCase()) ||
      l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Admin Command</span>
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl mb-8 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Trail & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable log of all user suspensions, role promotions, and editorial course moderation actions.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action or admin name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
            />
          </div>
        </div>

        {/* Logs Timeline */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No audit records matching your filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {log.action}
                    </span>
                    <span className="text-slate-400">Target:</span>
                    <span className="font-medium text-white">
                      {log.target_type} ({log.target_id})
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/80 mt-2">
                    {JSON.stringify(log.details)}
                  </p>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between text-[11px] text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{log.admin_name}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
