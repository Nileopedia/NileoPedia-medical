'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BarChart3, MessageCircleQuestion, Users, Brain } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const analyticsData = [
  { name: 'Jan', queries: 65, responses: 120 },
  { name: 'Feb', queries: 78, responses: 145 },
  { name: 'Mar', queries: 92, responses: 168 },
];

export default function AdminAnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Platform analytics and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion size={20} className="text-blue-600" />
                Total Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">532</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} className="text-emerald-600" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">84</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} className="text-purple-600" />
                AI Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">96%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-10 text-muted-foreground">{item.name}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Queries</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded">
                        <div className="h-full bg-blue-600 rounded" style={{ width: `${item.queries}%` }} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{item.queries}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Responses</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded">
                        <div className="h-full bg-emerald-600 rounded" style={{ width: `${item.responses / 2}%` }} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{item.responses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}