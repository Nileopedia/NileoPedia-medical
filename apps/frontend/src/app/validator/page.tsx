'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockReviewQueue } from '../../data/mockData';
import { ClipboardCheck, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function ValidatorPage() {
  const [reviewQueue] = useState(mockReviewQueue);

  return (
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
                <Badge variant={item.priority === 'high' ? 'warning' : 'default'}>{item.priority} priority</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  Due: {item.dueDate}
                </div>
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
  );
}