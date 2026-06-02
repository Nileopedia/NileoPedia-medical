'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { AppLayout } from '../../../components/layout/AppLayout';

const logs = [
  { id: '1', action: 'User registration', user: 'Dr. John Smith', timestamp: '2 hours ago', ip: '192.168.1.1' },
  { id: '2', action: 'Query submitted', user: 'Dr. Sarah Johnson', timestamp: '3 hours ago', ip: '192.168.1.2' },
];

export default function AdminLogsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">System Logs</h1>
        <p className="text-slate-600 dark:text-slate-400">View system logs and audit trail</p>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Action</th>
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">User</th>
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Timestamp</th>
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 text-slate-900 dark:text-slate-50">{log.action}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{log.user}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-500">{log.timestamp}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}