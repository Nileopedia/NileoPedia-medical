'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users, Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import { useRouter } from 'next/navigation';

interface Validator {
  id: string;
  fullName: string;
  email: string;
  role: string;
  specialization?: string | null;
  institution?: string | null;
  accountStatus: string;
  reviewsCompleted?: number;
  approvalRate?: number;
  averageReviewTime?: number;
}

export default function AdminValidatorsPage() {
  const router = useRouter();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    institution: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchValidators();
  }, [page, search]);

  const fetchValidators = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { validators: Validator[]; totalPages: number } }>(
        `/admin/validators?page=${page}&limit=20&search=${encodeURIComponent(search)}`
      );
      setValidators(response.data.validators || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      if (error instanceof Error && error.message === 'Please sign in to continue') {
        router.push('/login');
      } else {
        console.error('Failed to fetch validators:', error);
        addToast({ type: 'error', title: 'Failed to load validators' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddValidator = async () => {
    try {
      const result = await api.createValidator(formData);
      setValidators([...validators, { ...result, accountStatus: 'ACTIVE', reviewsCompleted: 0 }]);
      setShowAddModal(false);
      setFormData({ fullName: '', email: '', password: '', specialization: '', institution: '' });
      addToast({ type: 'success', title: 'Validator added successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('409') || err.message?.includes('already exists')) {
        addToast({ type: 'error', title: 'Email already registered' });
      } else {
        addToast({ type: 'error', title: 'Failed to add validator' });
      }
    }
  };

  const handleRemoveValidator = async (validatorId: string) => {
    if (!confirm('Are you sure you want to remove this validator?')) return;
    try {
      await api.request(`/admin/validators/${validatorId}`, { method: 'DELETE' });
      addToast({ type: 'success', title: 'Validator removed' });
      fetchValidators();
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to remove validator' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Validators</h1>
          <p className="text-sm text-muted-foreground">Manage medical validators</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
          <div className="relative flex-1">
            <Input
              placeholder="Search validators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" />
            Add Validator
          </Button>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg max-w-md w-full p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Add New Validator</h2>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@medical.org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Password (optional)</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave empty for auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Specialization</label>
                  <Input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Institution</label>
                  <Input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Hospital Name"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={handleAddValidator} disabled={!formData.fullName || !formData.email} className="flex-1 sm:flex-initial">
                    Add Validator
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users size={20} className="text-blue-600" />
              Validator Management ({validators.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 sm:py-8 text-sm">Loading validators...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Approval Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 sm:py-8 text-center text-muted-foreground">
                          No validators found. Add your first validator above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      validators.map((validator) => (
                        <TableRow key={validator.id}>
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-emerald-500">&#10003;</span>
                              {validator.fullName}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{validator.email}</TableCell>
                          <TableCell className="text-muted-foreground">{validator.specialization || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{validator.reviewsCompleted ?? 0}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {validator.approvalRate ? `${validator.approvalRate}%` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={validator.accountStatus === 'ACTIVE' ? 'success' : 'default'}>
                              {validator.accountStatus?.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => handleRemoveValidator(validator.id)}
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Remove validator"
                            >
                              <Trash2 size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="w-full sm:w-auto"
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