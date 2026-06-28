'use client';

import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Users, Plus, X } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

interface Validator {
  id: string;
  fullName: string;
  email: string;
  role: string;
  specialization?: string | null;
  institution?: string | null;
  accountStatus: string;
  reviews?: number;
  accuracy?: string;
}

export default function AdminValidatorsPage() {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    institution: '',
  });
  const { addToast } = useToast();

  const handleAddValidator = async () => {
    setLoading(true);
    try {
      const result = await api.createValidator(formData);
      setValidators([...validators, { ...result, accountStatus: 'ACTIVE', reviews: 0, accuracy: '100%' }]);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Validators</h1>
          <p className="text-sm text-muted-foreground">Manage medical validators</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus size={16} />
            Add Validator
          </button>
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
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                    placeholder="john@medical.org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Password (optional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                    placeholder="Leave empty for auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                    placeholder="Hospital Name"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleAddValidator}
                    disabled={loading || !formData.fullName || !formData.email}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 order-2 sm:order-1"
                  >
                    {loading ? 'Adding...' : 'Add Validator'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted w-full sm:w-auto order-1 sm:order-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users size={20} className="text-blue-600" />
              Validator Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 sm:py-8 text-center text-muted-foreground">
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
                      <TableCell>
                        <Badge variant={validator.accountStatus === 'ACTIVE' ? 'success' : 'default'}>
                          {validator.accountStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}