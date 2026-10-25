import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Shield,
  ArrowRight,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Users,
  Compass,
  PlayCircle,
  BarChart3,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res.success && res.data) {
          setFeaturedCourses(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured courses:', err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const handleStartLearning = () => {
    if (user) {
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'instructor') navigate('/instructor');
      else navigate('/admin');
    } else {
      onOpenAuth('register');
    }
  };

  const handleRoleCardClick = async (role: 'student' | 'instructor' | 'admin') => {
    if (user?.role === role) {
      navigate(`/${role}`);
    } else {
      // Instant switch for demo or open login
      await switchRole(role);
      navigate(`/${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Soft decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-200/40 via-indigo-100/30 to-rose-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Learn Smarter. Track Progress. Achieve More.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Your Next Skill <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">
                Starts Right Here.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
              Discover courses, learn at your own pace, track your progress, and turn your knowledge into real achievements.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base shadow-lg shadow-violet-500/25 transition flex items-center justify-center gap-2 group"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <button
                onClick={handleStartLearning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-base shadow-xs transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4 text-rose-500" />
                <span>Start Learning</span>
              </button>
            </div>

            {/* Micro Stats */}
            <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Progress</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">3 Roles</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Student &bull; Instructor &bull; Admin</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">Instant</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Certificate Validation</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">Zero Slop</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Server-Enforced State</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Gateways Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">
              Three Tailored Portals
            </h2>
            <p className="text-3xl font-bold text-slate-900">
              One Unified Learning Ecosystem
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Select any role card below to explore its authorized dashboard and capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div
              onClick={() => handleRoleCardClick('student')}
              className="bg-purple-50/50 hover:bg-purple-50 border border-purple-200/80 hover:border-purple-300 rounded-2xl p-7 transition cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-purple-950">Student Portal</h3>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Active Learner
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Enroll in published courses, stream video lectures, complete interactive lessons, submit server-graded assessments, and claim verifiable certificates.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Calculated progress ($completed / total$)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Daily learning streak tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Cryptographic certificate generator</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-purple-200/60 flex items-center justify-between text-purple-700 font-semibold text-xs group-hover:translate-x-0.5 transition">
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Instructor Card */}
            <div
              onClick={() => handleRoleCardClick('instructor')}
              className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 hover:border-emerald-300 rounded-2xl p-7 transition cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-emerald-950">Instructor Studio</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Course Author
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Author rich curricula, upload video lectures, design server-evaluated quizzes with pass/fail marks, manage draft/publish states, and monitor student cohorts.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Draft to Publish status lifecycle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Quiz Builder with answer keys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Student cohort grades & progress</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-emerald-200/60 flex items-center justify-between text-emerald-700 font-semibold text-xs group-hover:translate-x-0.5 transition">
                <span>Enter Instructor Studio</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Administrator Card */}
            <div
              onClick={() => handleRoleCardClick('admin')}
              className="bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-300 rounded-2xl p-7 transition cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-amber-950">Admin Command</h3>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Governance
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Supervise platform health, manage user accounts with instant suspension/reactivation, moderate and review submitted courses, and inspect audit activity logs.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>User suspension & role promotion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Platform moderation controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Tamper-evident audit activity feed</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-amber-200/60 flex items-center justify-between text-amber-800 font-semibold text-xs group-hover:translate-x-0.5 transition">
                <span>Enter Admin Command</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">
              Curated Courses
            </h2>
            <p className="text-3xl font-bold text-slate-900">Featured Learning Paths</p>
            <p className="text-sm text-slate-500 mt-1">
              Real published courses designed by industry experts with hands-on lessons.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-violet-600 hover:text-violet-700 font-semibold text-sm flex items-center gap-1.5 transition"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition duration-200 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium">
                      {course.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-violet-600/90 backdrop-blur-xs text-white text-[11px] font-medium">
                      {course.difficulty}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-2">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{course.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">
                        ({course.enrollments_count} enrolled)
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 hover:text-violet-600 transition">
                      <Link to={`/courses/${course.id}`}>{course.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.estimated_duration_hours} hrs</span>
                      </span>
                      <span>By {course.instructor_name}</span>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="w-full py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs text-center block transition"
                    >
                      View Curriculum & Enroll
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              The Learning Journey
            </span>
            <h2 className="text-3xl font-bold mt-2">How LearnSphere Works</h2>
            <p className="text-sm text-slate-400 mt-2">
              From course discovery to verified certification in 4 simple stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 relative">
              <span className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-lg font-bold mb-2">Discover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse our catalog with category filters, difficulty tags, and detailed curriculum previews.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-lg font-bold mb-2">Learn & Stream</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream video lectures, follow lesson guides, and mark milestones that sync automatically.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 relative">
              <span className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-lg font-bold mb-2">Assess</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take comprehensive quizzes evaluated securely on the server with immediate question breakdowns.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="text-lg font-bold mb-2">Certify</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Earn an official certificate with a unique validation code verifiable by anyone on the public registry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Institutional Trust</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Have a Certificate Code to Check?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every certificate issued on LearnSphere includes a permanent cryptographic identifier. Employers and academic institutions can verify credentials instantly.
            </p>
          </div>
          <Link
            to="/verify"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition flex items-center gap-2 flex-shrink-0"
          >
            <span>Verify Credential Registry</span>
            <ArrowRight className="w-4 h-4 text-violet-600" />
          </Link>
        </div>
      </section>
    </div>
  );
};
