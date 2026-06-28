'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { User } from '../../../types';
import { Users, Plus, Trash2, Shield } from 'lucide-react';

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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage platform users</p>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
            <Plus size={16} />
            Add User
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users size={20} className="text-blue-600" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-fit ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'validator' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role === 'admin' && <Shield size={14} />}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                        active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-red-600 hover:text-red-700" title="Delete user">
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}