import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Query } from '../../types';

interface RecentQueriesProps {
  queries: Query[];
}

const getStatusBadge = (status: Query['status']) => {
  switch (status) {
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejected</Badge>;
    case 'in_review':
      return <Badge variant="info">In Review</Badge>;
  }
};

export const RecentQueries: React.FC<RecentQueriesProps> = ({ queries }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Question</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-2 text-sm text-foreground max-w-xs truncate">{query.question}</td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">{query.category}</td>
                  <td className="py-3 px-2">{getStatusBadge(query.status)}</td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">{query.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
