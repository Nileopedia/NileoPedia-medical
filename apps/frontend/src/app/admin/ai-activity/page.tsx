'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Bot } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const aiActivities = [
  { id: '1', model: 'Llama-3.3-70b', action: 'Query processed', timestamp: '2 minutes ago', tokens: 1250 },
  { id: '2', model: 'Llama-3.3-70b', action: 'Response generated', timestamp: '5 minutes ago', tokens: 850 },
];

export default function AdminAiActivityPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">AI Activity</h1>
        <p className="text-muted-foreground">Monitor AI model activity and usage</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Queries Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">1,248</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tokens Used</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">45.2K</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">2.4s</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot size={20} className="text-blue-600" />
              Recent AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-foreground">Model</th>
                  <th className="text-left py-2 font-medium text-foreground">Action</th>
                  <th className="text-left py-2 font-medium text-foreground">Timestamp</th>
                  <th className="text-left py-2 font-medium text-foreground">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {aiActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Bot size={16} className="text-blue-600" />
                        <span className="text-foreground">{activity.model}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{activity.action}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-500">{activity.timestamp}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-500">{activity.tokens || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}