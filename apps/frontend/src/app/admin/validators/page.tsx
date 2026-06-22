'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, Plus, Mail, CheckCircle } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const validators = [
  { id: '1', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', status: 'active', reviews: 42, accuracy: '98%' },
  { id: '2', name: 'Dr. Michael Chen', email: 'michael@nileopedia.com', status: 'active', reviews: 38, accuracy: '96%' },
];

export default function AdminValidatorsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Validators</h1>
          <p className="text-muted-foreground">Manage medical validators</p>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            Add Validator
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Validator Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-foreground">Name</th>
                  <th className="text-left py-2 font-medium text-foreground">Email</th>
                  <th className="text-left py-2 font-medium text-foreground">Reviews</th>
                  <th className="text-left py-2 font-medium text-foreground">Accuracy</th>
                  <th className="text-left py-2 font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {validators.map((validator) => (
                  <tr key={validator.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500" />
                        {validator.name}
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{validator.email}</td>
                    <td className="py-3 text-muted-foreground">{validator.reviews}</td>
                    <td className="py-3 text-muted-foreground">{validator.accuracy}</td>
                    <td className="py-3">
                      <Badge variant={validator.status === 'active' ? 'success' : 'default'}>
                        {validator.status}
                      </Badge>
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