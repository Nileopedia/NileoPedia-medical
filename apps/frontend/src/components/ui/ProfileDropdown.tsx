'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Edit, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProfileDropdownProps {
  userName: string;
  userEmail: string;
  userRole: 'user' | 'validator' | 'admin';
}

const roleLabels = {
  user: 'Medical User',
  validator: 'Validator',
  admin: 'Admin',
};

const roleColors = {
  user: 'bg-blue-100 text-blue-700',
  validator: 'bg-amber-100 text-amber-700',
  admin: 'bg-purple-100 text-purple-700',
};

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName,
  userEmail,
  userRole,
}) => {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  return (
    <div className="py-2 w-64">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
            {getInitials(userName)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
            <span
              className={cn(
                'inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium',
                roleColors[userRole]
              )}
            >
              {roleLabels[userRole]}
            </span>
          </div>
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={() => router.push('/app/profile')}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          role="menuitem"
        >
          <User size={16} />
          <span>View profile</span>
        </button>

        <button
          onClick={() => router.push('/app/settings')}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          role="menuitem"
        >
          <Edit size={16} />
          <span>Edit profile</span>
        </button>

        <button
          onClick={() => router.push('/app/activity')}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          role="menuitem"
        >
          <Activity size={16} />
          <span>My activity</span>
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700 py-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          role="menuitem"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};