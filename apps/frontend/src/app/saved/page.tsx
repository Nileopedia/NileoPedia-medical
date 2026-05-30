'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bookmark } from 'lucide-react';
import { api } from '../../lib/api';
import { Query } from '../../types';

export default function SavedPage() {
  const [savedItems, setSavedItems] = React.useState<Query[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await api.getSavedResponses();
        setSavedItems(data);
      } catch (err) {
        console.error('Failed to load saved responses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const savedItemDisplay = [
    { id: '1', title: 'Type 2 Diabetes Management in Elderly', category: 'Endocrinology', savedAt: '2 days ago' },
    { id: '2', title: 'Hypertension Guidelines 2024', category: 'Cardiology', savedAt: '1 week ago' },
    { id: '3', title: 'Asthma Management in Children', category: 'Pediatrics', savedAt: '2 weeks ago' },
  ];

  return (
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
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Saved Date</th>
                <th className="w-20 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(savedItems.length > 0 ? savedItems : savedItemDisplay).map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-50">{item.question || item.title}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.createdAt || item.savedAt}</td>
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
  );
}