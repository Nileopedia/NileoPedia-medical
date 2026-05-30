'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Users, UserPlus, Shield, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers([
      { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah@nileopedia.com', role: 'user', status: 'active' },
      { id: '2', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', role: 'validator', status: 'active' },
      { id: '3', name: 'Admin User', email: 'admin@nileopedia.com', role: 'admin', status: 'active' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage platform users</p>
      </motion.div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Email</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Role</th>
                <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-center py-2 font-medium text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{user.name}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="py-3 capitalize">
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'validator' ? 'warning' : 'success'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-center">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
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