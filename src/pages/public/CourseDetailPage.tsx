import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Course, Lesson } from '../../types';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  PlayCircle,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  Check,
  User,
  Share2,
} from 'lucide-react';

interface CourseDetailPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onOpenAuth }) => {
  const { id } = useParams<{ id: string }>();
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgressPct, setCourseProgressPct] = useState(0);
  const [certificate, setCertificate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCourseData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getCourse(id);
      if (res.success && res.data) {
        setCourse(res.data.course);
        setLessons(res.data.lessons || []);
        setQuizzesCount(res.data.quizzesCount || 0);
        setIsEnrolled(!!res.data.enrollment);
        setCourseProgressPct(res.data.courseProgressPct || 0);
        setCertificate(res.data.certificate);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!id) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user) {
      onOpenAuth('register');
      return;
    }

    if (user.role !== 'student') {
      // Auto-switch to student or show alert
      if (window.confirm('Course enrollment requires a Student account. Would you like to switch to the student demo account?')) {
        await switchRole('student');
        return;
      } else {
        setErrorMessage('Only accounts with the Student role can enroll in courses.');
        return;
      }
    }

    setIsEnrolling(true);
    try {
      const res = await api.enrollCourse(id);
      if (res.success) {
        setIsEnrolled(true);
        setSuccessMessage('Enrollment successful! You have full access to all lessons and quizzes.');
        await fetchCourseData();
      } else {
        setErrorMessage(res.error?.message || 'Enrollment failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested course does not exist or has been archived.</p>
        <Link to="/courses" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Course Hero Banner */}
      <section className="bg-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {course.difficulty} Level
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{course.estimated_duration_hours} hours total</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{course.rating.toFixed(1)} rating</span>
                </div>
                <div>{course.enrollments_count} students enrolled</div>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Taught by <strong className="text-slate-200">{course.instructor_name}</strong></span>
                </div>
              </div>
            </div>

            {/* Floating Enrollment Card on Desktop */}
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-2xl border border-slate-100 lg:-mb-24 relative z-10">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {errorMessage && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-semibold text-purple-900 mb-1.5">
                      <span>You are Enrolled</span>
                      <span>{courseProgressPct}% completed</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${courseProgressPct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/student/learn/${course.id}`}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl text-center block transition shadow-md shadow-purple-500/20"
                  >
                    Continue to Lesson Player &rarr;
                  </Link>

                  {certificate && (
                    <Link
                      to="/student/certificates"
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition border border-amber-200"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>View Earned Certificate</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">Free</span>
                    <span className="text-xs text-slate-500 line-through">$89.99</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Open Educational Access
                    </span>
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isEnrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                  </button>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Full curriculum & video player access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{quizzesCount} interactive assessments included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Official verifiable certificate upon completion</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  <span>What You Will Master</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.learning_objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Course Curriculum</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lessons.length} lessons &bull; {quizzesCount} quiz assessments
                  </p>
                </div>
              </div>

              {lessons.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Curriculum content will be published soon.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isEnrolled ? (
                          lesson.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                          )
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{lesson.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lesson.duration_minutes}m</span>
                        </span>

                        {isEnrolled && (
                          <Link
                            to={`/student/learn/${course.id}?lesson=${lesson.id}`}
                            className="px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg font-medium transition text-xs"
                          >
                            Play
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Prerequisites</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                  {course.prerequisites.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
