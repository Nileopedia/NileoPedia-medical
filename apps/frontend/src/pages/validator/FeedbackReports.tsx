import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, MessageSquare } from 'lucide-react';

export const FeedbackReports: React.FC = () => {
  const feedbacks = [
    { id: '1', title: 'Hypertension Guidelines 2024', feedback: 'Excellent summary. The citations are up to date and relevant.', date: 'May 29, 2025', status: 'approved' },
    { id: '2', title: 'Alternative treatment for cancer', feedback: 'Rejected due to lack of peer-reviewed evidence. The AI hallucinated several non-existent studies.', date: 'May 27, 2025', status: 'rejected' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Feedback Reports</h1>
        <p className="text-slate-500">Review the clinical feedback provided during validations.</p>
      </div>

      <div className="space-y-4">
        {feedbacks.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Submitted {item.date}</p>
              </div>
              <Badge variant={item.status === 'approved' ? 'success' : 'danger'}>
                {item.status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <MessageSquare size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 italic">"{item.feedback}"</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={18} className="text-slate-600" />
            Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">12</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Constructive Feedback</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-2xl font-bold text-red-700">3</p>
              <p className="text-xs text-red-600 font-medium mt-1">Hallucination Flags</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">94%</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Avg. Response Quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
