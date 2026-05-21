import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Avatar } from '../components/ui/Avatar';
import { Database, HardDrive } from 'lucide-react';

const queriesOverTime = [
  { date: 'May 22', queries: 320 },
  { date: 'May 23', queries: 280 },
  { date: 'May 24', queries: 450 },
  { date: 'May 25', queries: 380 },
  { date: 'May 26', queries: 520 },
  { date: 'May 27', queries: 410 },
  { date: 'May 28', queries: 580 },
  { date: 'May 29', queries: 720 },
];

const queriesByCategory = [
  { name: 'Cardiology', value: 32, color: '#2563EB' },
  { name: 'Endocrinology', value: 24, color: '#7C3AED' },
  { name: 'Neurology', value: 16, color: '#10B981' },
  { name: 'Pediatrics', value: 14, color: '#F59E0B' },
  { name: 'Other', value: 12, color: '#64748B' },
];

const topUsers = [
  { name: 'Dr. Sarah Johnson', queries: 1246, avatar: 'SJ' },
  { name: 'Dr. Michael Chen', queries: 856, avatar: 'MC' },
  { name: 'Dr. Emily Davis', queries: 642, avatar: 'ED' },
];

const systemActivity = [
  { type: 'user', title: 'New user registered: Dr. James Wilson', time: '15 min ago', icon: 'user' },
  { type: 'db', title: 'Database optimized', time: '1 hour ago', icon: 'db' },
  { type: 'backup', title: 'System backup completed', time: '2 hours ago', icon: 'backup' },
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Analytics Dashboard</h1>
          <p className="text-slate-500">Platform performance and usage metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>May 22 – May 29, 2025</option>
          </select>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Queries" value="2,856" change="+15.2%" changeType="positive" />
        <StatCard title="Approved Responses" value="2,369" change="+23.5%" changeType="positive" />
        <StatCard title="Approval Rate" value="82.9%" change="+5.3%" changeType="positive" />
        <StatCard title="Avg. Response Time" value="2.4s" change="+8.1%" changeType="positive" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Queries Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={queriesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                  <Tooltip />
                  <Line type="monotone" dataKey="queries" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queries by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queriesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {queriesByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={queriesByCategory[index].color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {queriesByCategory.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-600 flex-1">{cat.name}</span>
                    <span className="text-sm font-medium text-slate-900">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users and System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-400 w-4">{index + 1}</span>
                  <Avatar name={user.name} size="sm" />
                  <span className="text-sm font-medium text-slate-900 flex-1">{user.name}</span>
                  <span className="text-sm text-slate-500">{user.queries.toLocaleString()} queries</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {activity.icon === 'user' && <Avatar name="JW" size="sm" className="bg-slate-400" />}
                    {activity.icon === 'db' && <Database size={16} className="text-emerald-600" />}
                    {activity.icon === 'backup' && <HardDrive size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
