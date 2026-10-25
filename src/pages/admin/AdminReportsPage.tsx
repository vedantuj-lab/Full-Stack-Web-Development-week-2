import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ChevronLeft,
  PieChart as PieIcon,
  BarChart3,
  Users,
} from 'lucide-react';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

export const AdminReportsPage: React.FC = () => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminReports();
        if (res.success && res.data) {
          setReportsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Analytics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualizing course enrollments, catalog category shares, and platform user distribution using actual database records.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Enrollment by Course Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    <span>Enrollment Volume Across Courses</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live tally of students actively enrolled per curriculum
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData?.enrollmentTrends || []}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Bar dataKey="enrollments" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Students Enrolled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Two Column Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown Pie */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  <span>Curriculum Distribution by Category</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Course catalogue coverage</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportsData?.categoryData || []}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                        fontSize={10}
                      >
                        {(reportsData?.categoryData || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#F8FAFC',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Platform User Demographics</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Distribution across roles</p>

                <div className="space-y-4 pt-4">
                  {(reportsData?.rolesCount || []).map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span>{item.role}</span>
                        <span className="text-amber-400 font-bold">{item.count} users</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(10, item.count * 15))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
