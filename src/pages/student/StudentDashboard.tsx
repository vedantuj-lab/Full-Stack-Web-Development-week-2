import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Course, Enrollment, Certificate } from '../../types';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ArrowRight,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, certsRes, assessRes] = await Promise.all([
          api.getMyCourses(),
          api.getMyCertificates(),
          api.getMyAssessments(),
        ]);

        if (coursesRes.success) setEnrolledCourses(coursesRes.data || []);
        if (certsRes.success) setCertificates(certsRes.data || []);
        if (assessRes.success) setAssessments(assessRes.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const completedCoursesCount = enrolledCourses.filter((c) => c.isCompleted).length;
  const inProgressCourses = enrolledCourses.filter((c) => !c.isCompleted);
  const nextUpCourse = inProgressCourses[0] || enrolledCourses[0];

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.full_name || 'Scholar'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pick up where you left off and keep building your verified skill set.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Enrolled Courses</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{enrolledCourses.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active curriculum paths</p>
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Completed Courses</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{completedCoursesCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">100% lessons verified</p>
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Earned Certificates</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{certificates.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified digital credentials</p>
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Learning Streak</span>
              <Flame className="w-4 h-4 text-rose-500 fill-current" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{user?.streak_days || 5} Days</p>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Keep the fire burning! 🔥</p>
          </div>
        </div>

        {/* Continue Learning Spotlight */}
        {nextUpCourse && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-xl relative overflow-hidden">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold mb-3">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Ready to Continue</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                {nextUpCourse.course?.title}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 line-clamp-2 mb-6">
                {nextUpCourse.course?.description}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-white/20 rounded-full h-2 max-w-xs overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${nextUpCourse.progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-300">
                  {nextUpCourse.progressPct}% Complete ({nextUpCourse.completedLessonsCount}/{nextUpCourse.totalLessons} lessons)
                </span>
              </div>

              <Link
                to={`/student/learn/${nextUpCourse.course?.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs rounded-xl shadow-md transition"
              >
                <span>Resume Lesson Player</span>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </Link>
            </div>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Enrolled Courses</h3>
            <Link to="/courses" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
              Browse More Courses &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-48 border border-slate-200" />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">You haven't enrolled in any courses yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore our catalog to start your learning journey.
              </p>
              <Link
                to="/courses"
                className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((item) => (
                <div
                  key={item.enrollment.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="flex gap-4 items-start mb-4">
                    <img
                      src={item.course?.thumbnail_url}
                      alt={item.course?.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                        {item.course?.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.course?.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        Instructor: {item.course?.instructor_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Progress: {item.completedLessonsCount} of {item.totalLessons} lessons</span>
                        <span className="font-bold text-purple-700">{item.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/student/learn/${item.course?.id}`}
                        className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl text-center transition"
                      >
                        Open Player
                      </Link>

                      {item.certificate ? (
                        <Link
                          to="/student/certificates"
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>Certificate</span>
                        </Link>
                      ) : (
                        item.isCompleted && (
                          <Link
                            to={`/student/learn/${item.course?.id}`}
                            className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Claim Certificate</span>
                          </Link>
                        )
                      )}
                    </div>
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
