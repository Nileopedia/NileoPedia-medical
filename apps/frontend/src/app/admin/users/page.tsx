'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { User } from '../../../types';
import { Users, Plus, Trash2, Mail, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers([
      { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah@nileopedia.com', role: 'user', avatar: undefined },
      { id: '2', name: 'Dr. Emily Davis', email: 'emily@nileopedia.com', role: 'validator', avatar: undefined },
      { id: '3', name: 'Admin User', email: 'admin@nileopedia.com', role: 'admin', avatar: undefined },
    ]);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage platform users</p>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} />
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
                  <th className="w-24 text-right py-2 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{user.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-fit ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'validator' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role === 'admin' && <Shield size={14} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                        active
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-red-600 hover:text-red-700" title="Delete user">
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
    </AppLayout>
  );
}