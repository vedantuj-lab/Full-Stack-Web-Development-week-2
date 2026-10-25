import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  Briefcase,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminOverview();
        if (res.success && res.data) {
          setOverview(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrator Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Governance & Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time platform metrics, user access controls, and moderation logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/moderation"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-amber-500/20"
            >
              Course Moderation
            </Link>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Registered Accounts</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.totalUsers || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {overview?.studentCount} students &bull; {overview?.instructorCount} instructors
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Courses</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.totalCourses || 0}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">
              {overview?.publishedCourses} published live
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Curricula In Review</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.draftCourses || 0}</p>
            <p className="text-[11px] text-amber-400 mt-0.5">Draft / Pending moderation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Enrollments</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.totalEnrollments || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded learning journeys</p>
          </div>
        </div>

        {/* Quick Command Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            to="/admin/users"
            className="p-6 bg-slate-900 hover:bg-slate-800/80 rounded-2xl border border-slate-800 transition group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">User & Role Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Inspect registered profiles, suspend violating accounts, and update role authorizations.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>Inspect Users Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/admin/moderation"
            className="p-6 bg-slate-900 hover:bg-slate-800/80 rounded-2xl border border-slate-800 transition group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Course Moderation</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Approve, reject, or convert courses to drafts across all instructors on the platform.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>Review Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/admin/reports"
            className="p-6 bg-slate-900 hover:bg-slate-800/80 rounded-2xl border border-slate-800 transition group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Reports & Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Review interactive charts: enrollment distribution, popular paths, and student completion trends.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>View Data Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Administrative Activity Logs
              </h3>
            </div>
            <Link to="/admin/logs" className="text-xs font-semibold text-amber-400 hover:underline">
              View All Logs &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs">
            {overview?.recentLogs?.length === 0 ? (
              <p className="text-slate-500 py-4 italic">No logged activity yet.</p>
            ) : (
              overview?.recentLogs?.map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-amber-300 mr-2">{log.action}</span>
                    <span className="text-slate-300">
                      by {log.admin_name} on {log.target_type} ({log.target_id})
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] flex-shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
