import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const MyValidations: React.FC = () => {
  const validations = [
    { id: '1', title: 'Hypertension Guidelines 2024', status: 'approved', date: 'May 29, 2025' },
    { id: '2', title: 'Diabetes Management in Elderly', status: 'approved', date: 'May 28, 2025' },
    { id: '3', title: 'Alternative treatment for cancer', status: 'rejected', date: 'May 27, 2025' },
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
        <h1 className="text-2xl font-bold text-slate-900 mb-1">My Validations</h1>
        <p className="text-slate-500">Responses you have reviewed and validated</p>
      </div>

      <div className="space-y-3">
        {validations.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">Validated {item.date}</p>
                </div>
                <Badge variant={item.status === 'approved' ? 'success' : 'danger'}>
                  {item.status === 'approved' ? 'Approved' : 'Rejected'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
