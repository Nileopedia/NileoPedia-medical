'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', queries: 65, responses: 120 },
  { name: 'Feb', queries: 78, responses: 145 },
  { name: 'Mar', queries: 92, responses: 168 },
  { name: 'Apr', queries: 85, responses: 152 },
  { name: 'May', queries: 112, responses: 189 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">Platform analytics and metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">532</p>
            <p className="text-sm text-emerald-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">84</p>
            <p className="text-sm text-slate-500">Registered medical professionals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">96%</p>
            <p className="text-sm text-slate-500">Validated responses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="w-10 text-slate-600 dark:text-slate-400">{item.name}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Queries</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded">
                      <div className="h-full bg-blue-600 rounded" style={{ width: `${item.queries}%` }} />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{item.queries}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">Responses</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded">
                      <div className="h-full bg-emerald-600 rounded" style={{ width: `${item.responses / 2}%` }} />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{item.responses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}