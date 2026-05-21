import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ReviewCardProps {
  id: string;
  title: string;
  category: string;
  submittedAt: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  onReview: (id: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  title,
  category,
  submittedAt,
  dueDate,
  priority,
  status,
  onReview,
}) => {
  const getPriorityBadge = () => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="success">Low Priority</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span>{category}</span>
              <span>•</span>
              <span>Submitted {submittedAt}</span>
              <span>•</span>
              <span>Due {dueDate}</span>
            </div>
            <div className="flex items-center gap-2">
              {getPriorityBadge()}
              {getStatusBadge()}
            </div>
          </div>
          <Button size="sm" onClick={() => onReview(id)}>
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
