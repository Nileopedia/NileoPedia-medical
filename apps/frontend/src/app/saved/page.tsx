'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bookmark } from 'lucide-react';
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Saved Responses</h1>
          <p className="text-slate-600 dark:text-slate-400">Your bookmarked medical responses</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Title</th>
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Category</th>
                  <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">Date</th>
                  <th className="w-20 py-2 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{item.question}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{item.createdAt}</td>
                    <td>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Bookmark size={16} />
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