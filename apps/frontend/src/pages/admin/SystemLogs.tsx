import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SystemLogs: React.FC = () => {
  const logs = [
    { id: '1', timestamp: '2025-05-29 10:45:23', level: 'INFO', service: 'API Server', message: 'User login successful: sarah@example.com' },
    { id: '2', timestamp: '2025-05-29 10:42:11', level: 'WARN', service: 'AI Model', message: 'High latency detected on GPT-4o endpoint (3.2s)' },
    { id: '3', timestamp: '2025-05-29 10:38:05', level: 'ERROR', service: 'Database', message: 'Connection timeout on replica-2, failover initiated.' },
    { id: '4', timestamp: '2025-05-29 10:30:00', level: 'INFO', service: 'Validator', message: 'Response approved by Dr. Michael Chen (ID: resp-123)' },
    { id: '5', timestamp: '2025-05-29 10:15:42', level: 'INFO', service: 'System', message: 'Scheduled backup completed successfully.' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'info';
      case 'WARN': return 'warning';
      case 'ERROR': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">System Logs</h1>
          <p className="text-slate-500">Monitor platform events, errors, and audit trails.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} />
          Export Logs
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0 font-mono text-xs">
                    <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getLevelColor(log.level) as any}>{log.level}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{log.service}</td>
                    <td className="py-3 px-4 text-slate-900">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
