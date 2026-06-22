'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Clock, CheckCircle, FileText, Eye } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const history = [
  { id: '1', title: 'Hypertension guidelines', action: 'approved', date: '2 days ago', category: 'Cardiology' },
  { id: '2', title: 'Diabetes management', action: 'approved', date: '1 week ago', category: 'Endocrinology' },
];

export default function ValidatorHistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Validation History</h1>
          <p className="text-muted-foreground">Your validation activity log</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-foreground">Title</th>
                  <th className="text-left py-2 font-medium text-foreground">Category</th>
                  <th className="text-left py-2 font-medium text-foreground">Action</th>
                  <th className="text-left py-2 font-medium text-foreground">Date</th>
                  <th className="w-20 text-right py-2 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-foreground">{item.title}</td>
                    <td className="py-3 text-muted-foreground">{item.category}</td>
                    <td className="py-3">
                      <Badge variant={item.action === 'approved' ? 'success' : 'default'} className="text-xs">
                        {item.action}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{item.date}</td>
                    <td className="py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-700" title="View details">
                        <Eye size={16} />
                      </button>
                    </td>
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