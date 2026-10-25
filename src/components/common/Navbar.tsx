import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  Shield,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import { NotificationItem } from '../../types';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: NotificationItem) => !n.is_read).length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const handleMarkRead = async (id: string, link?: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    if (link) {
      setNotificationsOpen(false);
      navigate(link);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-7 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Primary Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  Learn<span className="text-violet-600">Sphere</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider -mt-1 hidden sm:inline">
                  Learn Smarter. Track Progress.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-8 items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/')
                    ? 'text-violet-700 bg-violet-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/courses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/courses')
                    ? 'text-violet-700 bg-violet-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Explore Courses
              </Link>
              <Link
                to="/verify"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/verify')
                    ? 'text-violet-700 bg-violet-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Verify Credential
              </Link>

              {/* Role-Specific Shortcuts */}
              {user?.role === 'student' && (
                <>
                  <span className="h-4 w-px bg-slate-200 mx-1"></span>
                  <Link
                    to="/student"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive('/student')
                        ? 'text-purple-700 bg-purple-50 font-semibold'
                        : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50/50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>My Learning</span>
                  </Link>
                  <Link
                    to="/student/certificates"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/student/certificates')
                        ? 'text-purple-700 bg-purple-50 font-semibold'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
                    }`}
                  >
                    Certificates
                  </Link>
                </>
              )}

              {user?.role === 'instructor' && (
                <>
                  <span className="h-4 w-px bg-slate-200 mx-1"></span>
                  <Link
                    to="/instructor"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive('/instructor')
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Instructor Studio</span>
                  </Link>
                  <Link
                    to="/instructor/courses"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/instructor/courses')
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    My Courses
                  </Link>
                  <Link
                    to="/instructor/students"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/instructor/students')
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    Student Cohort
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <span className="h-4 w-px bg-slate-200 mx-1"></span>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive('/admin')
                        ? 'text-amber-800 bg-amber-50 font-semibold'
                        : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Admin Command</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/users')
                        ? 'text-amber-800 bg-amber-50 font-semibold'
                        : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/moderation"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/moderation')
                        ? 'text-amber-800 bg-amber-50 font-semibold'
                        : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                    }`}
                  >
                    Moderation
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkRead(n.id, n.link)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                                !n.is_read ? 'bg-violet-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5">
                                <span className={`flex h-2 w-2 rounded-full ${!n.is_read ? 'bg-violet-600' : 'bg-transparent'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
                  >
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/20"
                    />
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                        {user.full_name}
                      </span>
                      <RoleBadge role={user.role} />
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>

                      {user.role === 'student' && (
                        <>
                          <Link
                            to="/student"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>Student Dashboard</span>
                          </Link>
                          <Link
                            to="/student/certificates"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>My Certificates</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'instructor' && (
                        <>
                          <Link
                            to="/instructor"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Instructor Studio</span>
                          </Link>
                          <Link
                            to="/instructor/courses"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Manage Courses</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Command Center</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4" />
                        <span>Account Profile</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-violet-700 hover:bg-slate-50 rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
          >
            Home
          </Link>
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
          >
            Explore Courses
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
          >
            Verify Credential
          </Link>

          {user?.role === 'student' && (
            <>
              <div className="pt-2 border-t border-slate-100 font-semibold text-xs text-purple-700 px-3">
                Student Portal
              </div>
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 bg-purple-50"
              >
                Dashboard & My Learning
              </Link>
              <Link
                to="/student/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-purple-50"
              >
                Certificates
              </Link>
            </>
          )}

          {user?.role === 'instructor' && (
            <>
              <div className="pt-2 border-t border-slate-100 font-semibold text-xs text-emerald-700 px-3">
                Instructor Studio
              </div>
              <Link
                to="/instructor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-700 bg-emerald-50"
              >
                Studio Overview
              </Link>
              <Link
                to="/instructor/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50"
              >
                My Courses
              </Link>
              <Link
                to="/instructor/students"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-emerald-50"
              >
                Student Cohort
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <div className="pt-2 border-t border-slate-100 font-semibold text-xs text-amber-700 px-3">
                Administrator
              </div>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-amber-800 bg-amber-50"
              >
                Admin Command Center
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50"
              >
                User Registry
              </Link>
              <Link
                to="/admin/moderation"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-amber-50"
              >
                Course Moderation
              </Link>
            </>
          )}

          {!user && (
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="w-full py-2.5 rounded-lg bg-violet-600 text-white font-medium text-center"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
