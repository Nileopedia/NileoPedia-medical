'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Users } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const validators = [
  { id: '1', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', status: 'active', reviews: 42, accuracy: '98%' },
  { id: '2', name: 'Dr. Michael Chen', email: 'michael@nileopedia.com', status: 'active', reviews: 38, accuracy: '96%' },
];

export default function AdminValidatorsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Validators</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage medical validators</p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Users size={20} className="text-blue-600" />
            Validator Management
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Email</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Reviews</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Accuracy</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {validators.map((validator) => (
                <tr key={validator.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{validator.name}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{validator.email}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-500">{validator.reviews}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-500">{validator.accuracy}</td>
                  <td className="py-3">
                    <Badge variant={validator.status === 'active' ? 'success' : 'default'}>
                      {validator.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}