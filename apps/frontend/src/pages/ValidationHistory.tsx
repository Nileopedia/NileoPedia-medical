import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Clock } from 'lucide-react';

export const ValidationHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Validation History</h1>
        <p className="text-slate-500">Complete history of all validation activities</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Validation History</h3>
            <p className="text-slate-500 mb-4">View all past validation decisions and their outcomes</p>
            <div className="flex justify-center gap-4">
              <Badge variant="success">1,034 Approved</Badge>
              <Badge variant="danger">45 Rejected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
