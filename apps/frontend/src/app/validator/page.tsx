'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockReviewQueue } from '../../data/mockData';
import { Check, X } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';

export default function ValidatorPage() {
  const [reviewQueue] = useState(mockReviewQueue);

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Pending Reviews</h1>
          <p className="text-slate-600 dark:text-slate-400">Review AI-generated responses awaiting validation</p>
        </motion.div>

        <div className="grid gap-4">
          {reviewQueue.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.category} &bull; Submitted {item.submittedAt}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {item.priority} priority
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span>Due: {item.dueDate}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="success" size="sm">
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm">
                    <X size={16} className="mr-1" />
                    Reject
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}