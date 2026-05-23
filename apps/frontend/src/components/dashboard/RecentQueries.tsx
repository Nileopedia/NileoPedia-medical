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
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Question</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Category</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <td className="py-3 px-2 text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">{query.question}</td>
                  <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">{query.category}</td>
                  <td className="py-3 px-2">{getStatusBadge(query.status)}</td>
                  <td className="py-3 px-2 text-sm text-slate-500 dark:text-slate-400">{query.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
