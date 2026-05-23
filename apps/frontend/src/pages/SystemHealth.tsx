import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, Database, Server, Shield } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const services = [
    { name: 'API Server', status: 'operational', uptime: '99.9%', icon: Server },
    { name: 'Database', status: 'operational', uptime: '99.9%', icon: Database },
    { name: 'AI Model', status: 'operational', uptime: '99.5%', icon: Activity },
    { name: 'Authentication', status: 'operational', uptime: '100%', icon: Shield },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">System Health</h1>
        <p className="text-slate-500">Monitor platform services and infrastructure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.name}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{service.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                      <span className="text-xs text-slate-500 capitalize">{service.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Uptime: {service.uptime}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">CPU Usage</p>
              <p className="text-2xl font-bold text-slate-900">24%</p>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Memory Usage</p>
              <p className="text-2xl font-bold text-slate-900">62%</p>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Disk Usage</p>
              <p className="text-2xl font-bold text-slate-900">45%</p>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
