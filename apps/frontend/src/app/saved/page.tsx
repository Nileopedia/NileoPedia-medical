'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  const savedItems = [
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Saved Date</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.savedAt}</TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Bookmark size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}