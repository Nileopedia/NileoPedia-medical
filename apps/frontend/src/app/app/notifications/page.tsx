'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import type { Activity } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';

const mockNotifications: Activity[] = [
  {
    id: '1',
    type: 'query_submitted',
    title: 'New query submitted',
    description: 'Your question about hypertension is being processed',
    status: 'info',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    type: 'response_validated',
    title: 'Response validated',
    description: 'Your query has been reviewed by a medical professional',
    status: 'approved',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    type: 'query_rejected',
    title: 'Query rejected',
    description: 'Please review your question for clarity',
    status: 'rejected',
    timestamp: '2 hours ago',
  },
];

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your queries and responses</p>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockNotifications.map((notification) => {
                const iconMap = {
                  query_submitted: <MessageCircle size={20} className="text-blue-600" />,
                  response_validated: <CheckCircle size={20} className="text-emerald-600" />,
                  query_rejected: <AlertCircle size={20} className="text-red-600" />,
                };

                return (
                  <div key={notification.id} className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      {iconMap[notification.type as keyof typeof iconMap] || <Bell size={20} className="text-slate-600" />}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}