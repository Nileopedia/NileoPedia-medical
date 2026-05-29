'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  const users = [
    { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah@nileopedia.com', role: 'user', status: 'active' },
    { id: '2', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', role: 'validator', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage platform users</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{user.role}</Badge>
                  <Badge variant="success">{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}