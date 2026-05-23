import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const reports = [
    { id: '1', title: 'Monthly Validation Report', period: 'May 2025', type: 'PDF', size: '2.4 MB' },
    { id: '2', title: 'Query Analytics Summary', period: 'Q2 2025', type: 'PDF', size: '1.8 MB' },
    { id: '3', title: 'System Performance Report', period: 'May 2025', type: 'CSV', size: '856 KB' },
    { id: '4', title: 'User Activity Report', period: 'May 2025', type: 'PDF', size: '1.2 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Reports</h1>
          <p className="text-slate-500">Generate and download platform reports</p>
        </div>
        <Button className="gap-2">
          <Calendar size={16} />
          Generate Report
        </Button>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500">{report.period} • {report.type} • {report.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={14} />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
