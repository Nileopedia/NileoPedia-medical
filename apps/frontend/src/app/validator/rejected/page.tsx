'use client';

import React from 'react';
import { XCircle } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const rejectedItems = [
  { id: '1', title: 'Alternative cancer treatment', category: 'Oncology', rejectedAt: '3 days ago', reason: 'Insufficient evidence' },
];

export default function ValidatorRejectedPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Rejected Responses</h1>
          <p className="text-muted-foreground">Previously rejected responses</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <XCircle size={20} className="text-red-600" />
            Rejected Items
          </h2>
          <div className="space-y-4">
            {rejectedItems.map((item) => (
              <div key={item.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-xs text-red-600 mt-1">Reason: {item.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}