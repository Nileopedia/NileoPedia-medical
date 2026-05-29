'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Activity } from 'lucide-react';

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">System Health</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor system status and performance</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            <span className="text-slate-900 dark:text-slate-50">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}