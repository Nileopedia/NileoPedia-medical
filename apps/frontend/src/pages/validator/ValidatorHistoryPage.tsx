import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const ValidatorHistoryPage: React.FC = () => {
  const history = [
    { id: '1', title: 'Hypertension Guidelines 2024', category: 'Cardiology', status: 'approved', date: 'May 29, 2025', score: 95 },
    { id: '2', title: 'Diabetes Management in Elderly', category: 'Endocrinology', status: 'approved', date: 'May 28, 2025', score: 92 },
    { id: '3', title: 'Alternative treatment for cancer', category: 'Oncology', status: 'rejected', date: 'May 27, 2025', score: 45 },
    { id: '4', title: 'Acute Asthma in Children', category: 'Pediatrics', status: 'approved', date: 'May 26, 2025', score: 88 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} className="text-emerald-600" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Validation History</h1>
        <p className="text-slate-500">Complete history of your validation decisions and outcomes.</p>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>Validated {item.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="text-sm font-bold text-slate-900">{item.score}/100</p>
                  </div>
                  <Badge variant={item.status === 'approved' ? 'success' : 'danger'}>
                    {item.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
