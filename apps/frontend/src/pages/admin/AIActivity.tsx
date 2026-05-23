import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatCard } from '../../components/dashboard/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Bot, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const aiUsageData = [
  { model: 'GPT-4o + RAG', queries: 2450, avgTime: '2.1s' },
  { model: 'Claude 3 Opus', queries: 890, avgTime: '2.8s' },
  { model: 'Llama 3 70B', queries: 516, avgTime: '1.9s' },
];

export const AIActivity: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">AI Activity</h1>
        <p className="text-slate-500">Monitor AI model usage, performance, and flagged outputs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total AI Queries" value="3,856" change="+15.2%" changeType="positive" />
        <StatCard title="Avg. Response Time" value="2.4s" change="-0.2s" changeType="positive" />
        <StatCard title="Flagged Outputs" value="24" change="+3" changeType="negative" />
        <StatCard title="Confidence Score (Avg)" value="91.5%" />
      </div>

      {/* Model Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot size={18} className="text-blue-600" />
            Model Usage & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Bar dataKey="queries" fill="#2563EB" name="Total Queries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Outputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            Recently Flagged AI Outputs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { query: 'Can aspirin cure cancer?', reason: 'Unsafe medical claim', model: 'GPT-4o + RAG', status: 'Rejected', time: '10 min ago' },
              { query: 'Best home remedies for heart attack', reason: 'High risk of harm', model: 'Claude 3 Opus', status: 'Rejected', time: '1 hour ago' },
              { query: 'Unproven diabetes treatment', reason: 'Low evidence confidence (45%)', model: 'GPT-4o + RAG', status: 'Pending Review', time: '2 hours ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  {item.status === 'Rejected' ? (
                    <CheckCircle size={20} className="text-red-600 mt-0.5" />
                  ) : (
                    <Clock size={20} className="text-amber-600 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.query}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.reason} • {item.model} • {item.time}</p>
                  </div>
                </div>
                <Badge variant={item.status === 'Rejected' ? 'danger' : 'warning'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple Badge component inline since we didn't import it
const Badge = ({ children, variant }: { children: React.ReactNode; variant: string }) => {
  const variants: Record<string, string> = {
    danger: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.success}`}>{children}</span>;
};
