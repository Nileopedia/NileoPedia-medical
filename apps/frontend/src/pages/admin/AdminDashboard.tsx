import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, Shield, Activity, AlertTriangle } from 'lucide-react';

const queryVolumeData = [
  { date: 'Mon', queries: 420, validated: 380 },
  { date: 'Tue', queries: 380, validated: 350 },
  { date: 'Wed', queries: 510, validated: 480 },
  { date: 'Thu', queries: 490, validated: 460 },
  { date: 'Fri', queries: 620, validated: 590 },
  { date: 'Sat', queries: 310, validated: 290 },
  { date: 'Sun', queries: 280, validated: 260 },
];

const validationMetricsData = [
  { category: 'Cardiology', approved: 85, rejected: 15 },
  { category: 'Neurology', approved: 78, rejected: 22 },
  { category: 'Endocrinology', approved: 92, rejected: 8 },
  { category: 'Pediatrics', approved: 88, rejected: 12 },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
        <p className="text-slate-500">System overview, user activity, and platform performance.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,248" change="+5.2%" changeType="positive" />
        <StatCard title="Active Validators" value="42" change="+2" changeType="positive" />
        <StatCard title="Total Queries (24h)" value="3,856" change="+12.5%" changeType="positive" />
        <StatCard title="System Uptime" value="99.9%" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Query Volume vs Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={queryVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="queries" stroke="#2563EB" strokeWidth={2} name="Total Queries" />
                  <Line type="monotone" dataKey="validated" stroke="#10B981" strokeWidth={2} name="Validated" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              Validation Quality (Rejection Rates)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={validationMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved %" />
                  <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & AI Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Recent User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'Dr. Sarah Johnson', action: 'Submitted query', time: '2 min ago' },
                { user: 'Dr. Michael Chen', action: 'Approved response', time: '15 min ago' },
                { user: 'Dr. Emily Davis', action: 'Registered', time: '1 hour ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.user}</p>
                    <p className="text-xs text-slate-500">{item.action}</p>
                  </div>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              AI Monitoring (Flagged Outputs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { query: 'Alternative cancer cure', reason: 'Unsupported medical claim', status: 'Rejected' },
                { query: 'Homeopathy for diabetes', reason: 'Low evidence confidence', status: 'Pending Review' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{item.query}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
