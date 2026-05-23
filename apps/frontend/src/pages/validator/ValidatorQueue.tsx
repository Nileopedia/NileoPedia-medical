import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockReviewQueue } from '../../data/mockData';
import { Filter, Clock, AlertTriangle } from 'lucide-react';

type FilterType = 'all' | 'high' | 'dueToday' | 'myReviews';

export const ValidatorQueue: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: 14 },
    { key: 'high', label: 'High Priority', count: 5 },
    { key: 'dueToday', label: 'Due Today', count: 3 },
    { key: 'myReviews', label: 'My Reviews', count: 8 },
  ];

  const handleReview = (id: string) => {
    navigate(`/validator/review/${id}`);
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Pending Reviews</h1>
          <p className="text-slate-500">Review and validate AI-generated medical responses to ensure safety and accuracy.</p>
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
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleReview(item.id)}>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    {item.priority === 'high' && (
                      <Badge variant="danger" className="flex items-center gap-1">
                        <AlertTriangle size={12} /> High Priority
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Submitted {item.submittedAt}</span>
                    <span>•</span>
                    <span>Due {item.dueDate}</span>
                  </div>
                  <Badge variant="warning">Pending Review</Badge>
                </div>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleReview(item.id); }}>
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
