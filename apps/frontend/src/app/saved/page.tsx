'use client';

import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Bookmark, Eye, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';
import { AppLayout } from '../../components/layout/AppLayout';
import { useRouter } from 'next/navigation';

const mockSavedItems: Query[] = [
  { id: '1', question: 'Type 2 Diabetes Management in Elderly', category: 'Endocrinology', status: 'approved', createdAt: '2 days ago', updatedAt: '2 days ago', userId: '1' },
  { id: '2', question: 'Hypertension Guidelines 2024', category: 'Cardiology', status: 'approved', createdAt: '1 week ago', updatedAt: '1 week ago', userId: '1' },
  { id: '3', question: 'Asthma Management in Children', category: 'Pediatrics', status: 'approved', createdAt: '2 weeks ago', updatedAt: '2 weeks ago', userId: '1' },
];

export default function SavedPage() {
  const [savedItems, setSavedItems] = React.useState<Query[]>([]);
  const router = useRouter();

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
        if (err instanceof Error && err.message === 'Please sign in to continue') {
          router.push('/login');
        } else {
          console.error('Failed to load saved responses:', err);
          setSavedItems(mockSavedItems);
        }
      }
    };
    fetchSaved();
  }, [router]);

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Saved Responses</h1>
          <p className="text-sm text-muted-foreground">Your bookmarked medical responses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bookmark size={18} className="text-blue-600" />
              Saved Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{item.question}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-muted-foreground">{item.createdAt}</TableCell>
                    <TableCell className="text-center space-x-1.5 sm:space-x-2">
                      <button className="text-primary hover:text-primary/80" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="Remove">
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