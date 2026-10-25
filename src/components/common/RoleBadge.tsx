import React from 'react';
import { UserRole } from '../../types';

export const RoleBadge: React.FC<{ role: UserRole; size?: 'sm' | 'md' }> = ({ role, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (role) {
    case 'student':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200 ${sizeClasses}`}>
          Student
        </span>
      );
    case 'instructor':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 ${sizeClasses}`}>
          Instructor
        </span>
      );
    case 'admin':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          Administrator
        </span>
      );
    default:
      return null;
  }
};
