'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAppStore } from '../../store/appStore';
import { FileText, Search, Clock, CheckCircle } from 'lucide-react';

const activityIcons = {
  query_submitted: Search,
  response_validated: CheckCircle,
  query_rejected: FileText,
  user_registered: Clock,
};

const activityColors = {
  query_submitted: 'text-blue-500',
  response_validated: 'text-green-500',
  query_rejected: 'text-red-500',
  user_registered: 'text-slate-500',
};

export default function ActivityPage() {
  const { activities } = useAppStore();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">My Activity</h1>
          <p className="text-muted-foreground">Your recent actions and system events</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type] || Clock;
                  return (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <Icon className={`w-5 h-5 mt-0.5 ${activityColors[activity.type]}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}