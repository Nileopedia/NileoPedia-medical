import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockQueries } from '../data/mockData';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QueryHistory: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="info">In Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">My History</h1>
        <p className="text-slate-500">View all your previous medical queries and responses</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search your queries..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Queries list */}
      <div className="space-y-3">
        {mockQueries.map((query) => (
          <Card key={query.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link to="/ask" className="text-sm font-semibold text-slate-900 hover:text-blue-600 mb-1 block">
                    {query.question}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{query.category}</span>
                    <span>•</span>
                    <span>{query.createdAt}</span>
                  </div>
                </div>
                {getStatusBadge(query.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
