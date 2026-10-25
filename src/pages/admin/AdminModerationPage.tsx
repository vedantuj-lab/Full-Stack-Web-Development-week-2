import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const AdminModerationPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to load courses for moderation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApprove = async (course: Course) => {
    try {
      const res = await api.approveCourse(course.id);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, status: 'published' } : c))
        );
        setFeedback(`Course "${course.title}" approved and published to the public catalog.`);
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (course: Course) => {
    try {
      const res = await api.rejectCourse(course.id);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, status: 'draft' } : c))
        );
        setFeedback(`Course "${course.title}" unpublished and moved to draft status.`);
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

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
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Editorial Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Course Moderation & Quality Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervise curriculum submissions across all platform instructors. Approve verified paths or return draft status for revisions.
          </p>
        </div>

        {feedback && (
          <div className="p-4 mb-6 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Courses Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No courses found on platform.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Course Details</th>
                    <th className="px-6 py-3.5">Instructor</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Enrollments</th>
                    <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white line-clamp-1">{course.title}</div>
                            <div className="text-slate-400 text-[11px] line-clamp-1">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {course.instructor_name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {course.category} ({course.difficulty})
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            course.status === 'published'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {course.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {course.enrollments_count || 0} students
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/courses/${course.id}`}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                            title="Preview Course"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {course.status !== 'published' ? (
                            <button
                              onClick={() => handleApprove(course)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(course)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Move to Draft</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
