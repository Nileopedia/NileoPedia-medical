import React from 'react';
import { Badge } from '../ui/Badge';
import { AIResponse } from '../../types';

interface ValidationBadgeProps {
  status: AIResponse['status'];
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>;
    case 'in_review':
      return <Badge variant="warning">Pending Review</Badge>;
  }
};
