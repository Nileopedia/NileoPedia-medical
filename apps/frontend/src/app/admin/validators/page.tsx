'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Users } from 'lucide-react';

const validators = [
  { id: '1', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', status: 'active', reviews: 42, accuracy: '98%' },
  { id: '2', name: 'Dr. Michael Chen', email: 'michael@nileopedia.com', status: 'active', reviews: 38, accuracy: '96%' },
  { id: '3', name: 'Dr. Sarah Wilson', email: 'sarah.wilson@nileopedia.com', status: 'inactive', reviews: 25, accuracy: '94%' },
];

export default function AdminValidatorsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Validators</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage medical validators</p>
      </motion.div>

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
        </CardContent>
      </Card>
    </div>
  );
}