import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  Briefcase,
  BookOpen,
  Users,
  CheckCircle2,
  FileEdit,
  PlusCircle,
  HelpCircle,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ovRes, crsRes] = await Promise.all([
          api.getInstructorOverview(),
          api.getInstructorCourses(),
        ]);
        if (ovRes.success) setOverview(ovRes.data);
        if (crsRes.success) setCourses(crsRes.data || []);
      } catch (err) {
        console.error('Failed to load instructor overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Instructor Studio &bull; Content Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Instructor Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome, {user?.full_name}. Author curricula, configure assessments, and review student cohort performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/instructor/courses"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create / Manage Courses</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Courses</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.totalCourses || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Under your instruction</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Published Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.publishedCount || 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Enrolling students</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Draft Curricula</span>
              <FileEdit className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.draftCount || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Works in progress</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Enrollments</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{overview?.totalEnrollments || 0}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Active learners</p>
          </div>
        </div>

        {/* Quick Studio Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link
            to="/instructor/courses"
            className="p-6 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-200 transition group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Curriculum & Course Manager</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create new courses, add lessons, edit video URLs, and toggle publish states.
            </p>
          </Link>

          <Link
            to="/instructor/quiz-builder"
            className="p-6 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-200 transition group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quiz & Assessment Builder</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Design multiple-choice assessments with point weights and server-evaluated answer keys.
            </p>
          </Link>

          <Link
            to="/instructor/students"
            className="p-6 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-200 transition group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Student Cohort Performance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor individual student progress percentages, completed lessons, and quiz results.
            </p>
          </Link>
        </div>

        {/* Instructor's Courses Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Your Authored Courses</h3>
            <Link to="/instructor/courses" className="text-xs font-semibold text-emerald-700 hover:underline">
              Manage All Courses &rarr;
            </Link>
          </div>

          {courses.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 italic">No courses created yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((c) => (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.thumbnail_url}
                      alt={c.title}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-500">
                        {c.category} &bull; {c.difficulty} &bull; {c.lessonsCount} lessons &bull; {c.enrollmentsCount} students
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        c.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </span>

                    <Link
                      to={`/instructor/curriculum/${c.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Curriculum
                    </Link>

                    <Link
                      to={`/instructor/students?course=${c.id}`}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
                    >
                      Students
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
