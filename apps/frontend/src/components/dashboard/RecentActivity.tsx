import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Activity } from '../../types';
import { FileQuestion, CheckCircle, XCircle, UserPlus } from 'lucide-react';

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'query_submitted':
      return <FileQuestion size={16} className="text-blue-600" />;
    case 'response_validated':
      return <CheckCircle size={16} className="text-emerald-600" />;
    case 'query_rejected':
      return <XCircle size={16} className="text-red-600" />;
    case 'user_registered':
      return <UserPlus size={16} className="text-slate-600" />;
  }
};

const getStatusBadge = (status: Activity['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>;
    case 'info':
      return <Badge variant="info">Info</Badge>;
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View all activity
        </button>
      </CardContent>
    </Card>
  );
};
