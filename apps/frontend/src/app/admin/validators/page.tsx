'use client';

import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Users, Plus, Mail, CheckCircle, X } from 'lucide-react';
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Validators</h1>
          <p className="text-muted-foreground">Manage medical validators</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Validator
          </button>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">Add New Validator</h2>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
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
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddValidator}
                    disabled={loading || !formData.fullName || !formData.email}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Validator'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
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
                  <th className="text-left py-2 font-medium text-foreground">Specialization</th>
                  <th className="text-left py-2 font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {validators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No validators found. Add your first validator above.
                    </td>
                  </tr>
                ) : (
                  validators.map((validator) => (
                    <tr key={validator.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          {validator.fullName}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{validator.email}</td>
                      <td className="py-3 text-muted-foreground">{validator.specialization || '-'}</td>
                      <td className="py-3">
                        <Badge variant={validator.accountStatus === 'ACTIVE' ? 'success' : 'default'}>
                          {validator.accountStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}