'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Activity, Cpu, Database, HardDrive } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const systemStats = {
  cpuUsage: '42%',
  memoryUsage: '6.2GB / 16GB',
  diskUsage: '120GB / 500GB',
  uptime: '14 days',
};

export default function AdminSystemPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">System Health</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor system status and performance</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Cpu size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{systemStats.cpuUsage}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{systemStats.memoryUsage}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disk Space</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HardDrive size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{systemStats.diskUsage}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-emerald-600" />
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{systemStats.uptime}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['API Server', 'Database', 'Redis Cache', 'AI Service'].map((service) => (
                <div key={service} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300">{service}</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                    operational
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}