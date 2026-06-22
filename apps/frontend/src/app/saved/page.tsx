'use client';

import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bookmark, Eye, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';

const mockSavedItems: Query[] = [
  { id: '1', question: 'Type 2 Diabetes Management in Elderly', category: 'Endocrinology', status: 'approved', createdAt: '2 days ago', updatedAt: '2 days ago', userId: '1' },
  { id: '2', question: 'Hypertension Guidelines 2024', category: 'Cardiology', status: 'approved', createdAt: '1 week ago', updatedAt: '1 week ago', userId: '1' },
  { id: '3', question: 'Asthma Management in Children', category: 'Pediatrics', status: 'approved', createdAt: '2 weeks ago', updatedAt: '2 weeks ago', userId: '1' },
];

export default function SavedPage() {
  const [savedItems, setSavedItems] = React.useState<Query[]>([]);

  useEffect(() => {
    const fetchSaved = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setSavedItems(mockSavedItems);
        return;
      }
      try {
        const data = await api.getSavedResponses();
        setSavedItems(data);
      } catch (err) {
        console.error('Failed to load saved responses:', err);
        setSavedItems(mockSavedItems);
      }
    };
    fetchSaved();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Saved Responses</h1>
          <p className="text-muted-foreground">Your bookmarked medical responses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark size={20} className="text-blue-600" />
              Saved Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-foreground">Title</th>
                  <th className="text-left py-2 font-medium text-foreground">Category</th>
                  <th className="text-left py-2 font-medium text-foreground">Date</th>
                  <th className="w-20 py-2 font-medium text-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-foreground">{item.question}</td>
                    <td className="py-3 text-muted-foreground">{item.category}</td>
                    <td className="py-3 text-muted-foreground">{item.createdAt}</td>
                    <td className="py-3 text-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="Remove">
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