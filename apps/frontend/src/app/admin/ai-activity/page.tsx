'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Bot, Activity, BarChart3 } from 'lucide-react';

const aiActivities = [
  { id: '1', model: 'GPT-4o', action: 'Query processed', timestamp: '2 minutes ago', tokens: 1250 },
  { id: '2', model: 'GPT-4o', action: 'Response generated', timestamp: '5 minutes ago', tokens: 850 },
  { id: '3', model: 'Embedding Model', action: 'Document indexed', timestamp: '1 hour ago', tokens: 0 },
];

export default function AdminAiActivityPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">AI Activity</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor AI model activity and usage</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Queries Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">1,248</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">45.2K</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">2.4s</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Recent AI Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Model</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Action</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Timestamp</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {aiActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-blue-600" />
                      <span className="text-slate-900 dark:text-slate-50">{activity.model}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{activity.action}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-500">{activity.timestamp}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-500">{activity.tokens || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}