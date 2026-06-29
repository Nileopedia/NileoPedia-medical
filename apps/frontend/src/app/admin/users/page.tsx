'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { api } from '../../../lib/api';
import { Users, Plus, Trash2, Shield, Edit, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: string;
  specialization?: string | null;
  institution?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { users: BackendUser[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(
        `/admin/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      addToast({ type: 'error', title: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.request(`/admin/users/${userId}`, { method: 'DELETE' });
      addToast({ type: 'success', title: 'User deleted' });
      fetchUsers();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to delete user' });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await api.request(`/admin/users/${userId}/suspend`, { method: 'PATCH' });
      addToast({ type: 'success', title: 'User suspended' });
      fetchUsers();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to suspend user' });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await api.request(`/admin/users/${userId}/activate`, { method: 'PATCH' });
      addToast({ type: 'success', title: 'User activated' });
      fetchUsers();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to activate user' });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await api.request(`/admin/users/${userId}/reset-password`, { method: 'POST' });
      addToast({ type: 'success', title: 'Password reset email sent' });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to reset password' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage platform users</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
          <div className="relative flex-1">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users size={20} className="text-blue-600" />
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading users...</div>
            ) : (
              <>
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
                        <TableCell className="font-medium text-foreground">{user.fullName}</TableCell>
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
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            user.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.accountStatus?.toLowerCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="p-1 text-primary hover:text-primary/80"
                            title="Reset password"
                          >
                            <Key size={16} />
                          </button>
                          {user.accountStatus === 'ACTIVE' ? (
                            <button
                              onClick={() => handleSuspendUser(user.id)}
                              className="p-1 text-amber-600 hover:text-amber-700"
                              title="Suspend user"
                            >
                              <Edit size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-700"
                              title="Activate user"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}