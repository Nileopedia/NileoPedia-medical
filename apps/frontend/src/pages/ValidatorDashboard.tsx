import React, { useState } from 'react';
import { ReviewCard } from '../components/validator/ReviewCard';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockReviewQueue } from '../data/mockData';
import { Filter, Check, X } from 'lucide-react';

type FilterType = 'all' | 'high' | 'dueToday' | 'myReviews';

export const ValidatorDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: 14 },
    { key: 'high', label: 'High Priority', count: 5 },
    { key: 'dueToday', label: 'Due Today', count: 3 },
    { key: 'myReviews', label: 'My Reviews', count: 8 },
  ];

  const handleReview = (id: string) => {
    console.log('Reviewing:', id);
  };

  const filteredQueue = mockReviewQueue.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'high') return item.priority === 'high';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Validation / Review Queue</h1>
          <p className="text-slate-500">Review and validate AI-generated medical responses</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Review queue */}
      <div className="space-y-3">
        {filteredQueue.map((item) => (
          <ReviewCard
            key={item.id}
            id={item.id}
            title={item.title}
            category={item.category}
            submittedAt={item.submittedAt}
            dueDate={item.dueDate}
            priority={item.priority as 'high' | 'medium' | 'low'}
            status={item.status as 'pending' | 'approved' | 'rejected'}
            onReview={handleReview}
          />
        ))}
      </div>

      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all reviews
      </button>

      {/* Review detail modal placeholder */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Details</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">AI Response Preview</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  Management of Type 2 Diabetes in elderly patients requires individualized treatment goals...
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Citations</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">Guideline</Badge>
                <Badge variant="outline">ADA</Badge>
                <Badge variant="outline">2024</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Feedback</h4>
              <textarea
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
                placeholder="Add your feedback here..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Check size={16} />
                Approve
              </Button>
              <Button variant="danger" className="gap-2">
                <X size={16} />
                Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
