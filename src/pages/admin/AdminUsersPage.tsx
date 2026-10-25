import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { RoleBadge } from '../../components/common/RoleBadge';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  XCircle,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminUsers({
        search,
        role: selectedRole,
        status: selectedStatus,
      });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'suspended' ? 'suspend' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} account "${user.email}"?`)) return;

    try {
      const res = await api.setUserStatus(user.id, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        setFeedback(`User ${user.email} status changed to ${nextStatus.toUpperCase()}.`);
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (user: UserProfile, newRole: UserRole) => {
    if (user.role === newRole) return;
    if (!window.confirm(`Change role of "${user.email}" to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await api.setUserRole(user.id, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        setFeedback(`User ${user.email} promoted to ${newRole.toUpperCase()}.`);
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to change role');
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
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Identity Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Accounts & Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, suspend/reactivate accounts, and manage role-based authorization records. All actions are logged to the audit feed.
          </p>
        </div>

        {feedback && (
          <div className="p-4 mb-6 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No accounts match your criteria.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Assigned Role</th>
                    <th className="px-6 py-3.5">Account Status</th>
                    <th className="px-6 py-3.5">Streak</th>
                    <th className="px-6 py-3.5">Registration Date</th>
                    <th className="px-6 py-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{u.status.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {u.streak_days || 0} days
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Selector */}
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1"
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Administrator</option>
                          </select>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                              u.status === 'active'
                                ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
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
