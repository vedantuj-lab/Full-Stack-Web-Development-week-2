import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, GraduationCap, Briefcase, RefreshCw, LogOut, ChevronDown } from 'lucide-react';
import { api } from '../../api/client';

export const QuickDemoBar: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean initial demonstration state?')) return;
    setIsResetting(true);
    try {
      await api.resetDatabase();
      setResetMessage('Database restored to initial seed state.');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setResetMessage('Failed to reset.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-[10px] bg-slate-800 px-2 py-0.5 rounded">
            Live Demo Navigator
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Active Persona:
          </span>
          {user ? (
            <span className="font-medium text-white flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {user.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-purple-400" />}
              {user.role === 'instructor' && <Briefcase className="w-3.5 h-3.5 text-emerald-400" />}
              {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
              <span>{user.full_name}</span>
              <span className="text-slate-400 text-[10px]">({user.role.toUpperCase()})</span>
            </span>
          ) : (
            <span className="text-slate-400 italic">Guest (Not Signed In)</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 hidden md:inline text-[11px] mr-1">Switch View:</span>
          
          <button
            onClick={() => switchRole('student')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'student'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Switch to Student Alex Rivera"
          >
            <GraduationCap className="w-3 h-3 text-purple-300" />
            <span>Student</span>
          </button>

          <button
            onClick={() => switchRole('instructor')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'instructor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Switch to Instructor Dr. Elena Vance"
          >
            <Briefcase className="w-3 h-3 text-emerald-300" />
            <span>Instructor</span>
          </button>

          <button
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Switch to Administrator Marcus Chen"
          >
            <Shield className="w-3 h-3 text-amber-300" />
            <span>Admin</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-2 py-1 bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-400 rounded flex items-center gap-1 transition"
              title="Sign Out to Public View"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Guest</span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="ml-2 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded flex items-center gap-1 transition"
            title="Reset dataset to initial demo seeds"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Reset Seeds</span>
          </button>

          {resetMessage && (
            <span className="text-emerald-400 text-[10px] ml-1">{resetMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
};
