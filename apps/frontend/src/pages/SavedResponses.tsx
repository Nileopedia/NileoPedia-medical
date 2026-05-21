import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Bookmark, Search } from 'lucide-react';

export const SavedResponses: React.FC = () => {
  const savedItems = [
    { id: '1', title: 'Management of Type 2 Diabetes in Elderly Patients', category: 'Endocrinology', date: 'May 29, 2025' },
    { id: '2', title: 'Hypertension Guidelines 2024', category: 'Cardiology', date: 'May 28, 2025' },
    { id: '3', title: 'Acute Asthma Management in Children', category: 'Pediatrics', date: 'May 27, 2025' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Saved Responses</h1>
        <p className="text-slate-500">Your bookmarked medical responses and references</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search saved responses..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {savedItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>Saved {item.date}</span>
                  </div>
                </div>
                <Badge variant="success">Approved</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedItems.length === 0 && (
        <div className="text-center py-12">
          <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No saved responses</h3>
          <p className="text-slate-500">Bookmark responses to save them here for quick access</p>
        </div>
      )}
    </div>
  );
};
