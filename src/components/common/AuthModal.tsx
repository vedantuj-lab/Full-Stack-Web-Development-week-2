import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Shield, GraduationCap, Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, switchRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await register(email, password, fullName, role);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (targetRole: 'student' | 'instructor' | 'admin') => {
    setIsSubmitting(true);
    await switchRole(targetRole);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login'
                ? 'Sign in to access your courses, quizzes, and certificates.'
                : 'Join LearnSphere to unlock world-class learning.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition ${
              mode === 'login'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition ${
              mode === 'register'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Primary Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                    role === 'student'
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold leading-none">Student</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Learn & certify</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                    role === 'instructor'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold leading-none">Instructor</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Publish & teach</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium text-sm shadow-md shadow-violet-500/20 transition disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to LearnSphere'
              : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Demo Accounts Section */}
        <div className="px-6 pb-6 pt-2 bg-slate-50/80 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Or Sign In With 1-Click Demo Persona:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-2 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Alex Rivera</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('instructor')}
              className="px-2 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Instructor</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Dr. Vance</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-2 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition group shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Marcus Chen</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
