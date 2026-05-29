'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bot } from 'lucide-react';

export default function AdminAiActivityPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">AI Activity</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor AI model activity and usage</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>AI Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">AI activity monitoring coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}