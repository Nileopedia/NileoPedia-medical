'use client';

import React from 'react';
import { Avatar } from '../../../components/ui/Avatar';
import { User, Mail, BadgeCheck } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { AppLayout } from '../../../components/layout/AppLayout';

export default function ValidatorProfilePage() {
  const { user } = useAppStore();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">Your validator account information</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
          <div className="flex items-center gap-6 mb-6">
            <Avatar name={user?.name || 'Validator'} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{user?.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BadgeCheck size={16} className="text-emerald-600" />
                Verified Validator
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Medical Professional</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}