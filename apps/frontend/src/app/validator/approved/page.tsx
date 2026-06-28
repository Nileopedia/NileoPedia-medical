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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Approved Responses</h1>
          <p className="text-sm text-muted-foreground">Previously validated responses</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            <ClipboardCheck size={18} className="text-blue-600" />
            Approved Items
          </h2>
          <div className="space-y-2.5 sm:space-y-4">
            {approvedItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 border border-border rounded-lg gap-2">
                <div>
                  <p className="text-sm sm:text-base font-medium text-foreground">{item.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    {item.status}
                  </Badge>
                  <span className="text-xs sm:text-sm text-muted-foreground">{item.approvedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}