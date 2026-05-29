'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/dashboard/StatCard';
import { Users, Activity, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">System overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value="1,248" icon={<Users size={20} className="text-blue-600" />} />
        <StatCard title="Active Validators" value="86" icon={<Users size={20} className="text-emerald-600" />} />
        <StatCard title="System Status" value="Healthy" icon={<Activity size={20} className="text-purple-600" />} />
      </div>
    </div>
  );
}