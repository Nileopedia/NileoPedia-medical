'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Bell, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    title: 'New review pending',
    description: 'A query needs your validation in Cardiology',
    type: 'review',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    title: 'Review approved',
    description: 'Your validation has been accepted',
    type: 'approved',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    title: 'System update',
    description: 'New medical guidelines added to the knowledge base',
    type: 'info',
    timestamp: '2 hours ago',
  },
];

export default function ValidatorNotificationsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Notifications</h1>
        <p className="text-slate-600 dark:text-slate-400">Review assignments and system updates</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockNotifications.map((notification) => {
              const iconMap = {
                review: <FileText size={20} className="text-amber-600" />,
                approved: <CheckCircle size={20} className="text-emerald-600" />,
                info: <Bell size={20} className="text-blue-600" />,
              };

              return (
                <div key={notification.id} className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    {iconMap[notification.type as keyof typeof iconMap]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-50">{notification.title}</h3>
                      <Badge variant="default" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{notification.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}