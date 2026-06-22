'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Bell, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Activity } from '../../../types';
import { AppLayout } from '../../../components/layout/AppLayout';

const mockNotifications: Activity[] = [
  {
    id: '1',
    type: 'query_submitted',
    title: 'New review pending',
    description: 'A query needs your validation in Cardiology',
    status: 'info',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    type: 'response_validated',
    title: 'Review approved',
    description: 'Your validation has been accepted',
    status: 'approved',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'query_rejected',
    title: 'System update',
    description: 'New medical guidelines added to the knowledge base',
    status: 'rejected',
    timestamp: '2 hours ago',
  },
];

export default function ValidatorNotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Review assignments and system updates</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Bell size={20} className="text-blue-600" />
            Recent Notifications
          </h2>
          <div className="space-y-4">
            {mockNotifications.map((notification) => {
              const iconMap = {
                query_submitted: <FileText size={20} className="text-amber-600" />,
                response_validated: <CheckCircle size={20} className="text-emerald-600" />,
                query_rejected: <AlertCircle size={20} className="text-red-600" />,
              };

              return (
                <div key={notification.id} className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    {iconMap[notification.type as keyof typeof iconMap]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{notification.title}</h3>
                      <Badge variant={notification.status === 'approved' ? 'success' : notification.status === 'rejected' ? 'default' : 'default'} className="text-xs">
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}