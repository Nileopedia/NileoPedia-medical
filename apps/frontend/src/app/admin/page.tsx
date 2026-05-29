'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../../components/dashboard/StatCard';

export default function AdminDashboard() {
  const stats = {
    totalUsers: 1248,
    activeValidators: 86,
    systemStatus: 'Healthy',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">System overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers.toString()} />
        <StatCard title="Active Validators" value={stats.activeValidators.toString()} />
        <StatCard title="System Status" value={stats.systemStatus} />
      </div>
    </div>
  );
}