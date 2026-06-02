'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { ClipboardCheck } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

interface ReviewItem {
  id: string;
  title: string;
  category: string;
  status: string;
  approvedAt: string;
}

const approvedItems: ReviewItem[] = [
  { id: '1', title: 'Hypertension Guidelines 2024', category: 'Cardiology', status: 'approved', approvedAt: '2 hours ago' },
  { id: '2', title: 'Type 2 Diabetes Management', category: 'Endocrinology', status: 'approved', approvedAt: '1 day ago' },
];

export default function ValidatorApprovedPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Approved Responses</h1>
          <p className="text-slate-600 dark:text-slate-400">Previously validated responses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <ClipboardCheck size={20} className="text-blue-600" />
            Approved Items
          </h2>
          <div className="space-y-4">
            {approvedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    {item.status}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.approvedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}