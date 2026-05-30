'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { User, Mail, Building2, Calendar, Edit3 } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';

export default function ProfilePage() {
  const { user } = useAppStore();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account settings</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <Avatar name={user?.name || 'User'} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{user?.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Medical Institution</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Member since 2024</span>
            </div>
          </div>

          <button className="mt-6 flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Edit3 size={16} />
            Edit Profile
          </button>
        </CardContent>
      </Card>
    </div>
  );
}