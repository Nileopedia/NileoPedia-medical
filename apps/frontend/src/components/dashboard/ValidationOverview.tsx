import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ValidationStat } from '../../types';

interface ValidationOverviewProps {
  stats: ValidationStat;
}

export const ValidationOverview: React.FC<ValidationOverviewProps> = ({ stats }) => {
  const data = [
    { name: 'Approved', value: stats.approved, percentage: stats.approvalRate },
    { name: 'Pending', value: stats.pending, percentage: ((stats.pending / stats.total) * 100).toFixed(1) },
    { name: 'Rejected', value: stats.rejected, percentage: ((stats.rejected / stats.total) * 100).toFixed(1) },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Validation Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{stats.approvalRate}%</span>
              <span className="text-xs text-muted-foreground">Approval Rate</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                <span className="text-sm font-medium text-foreground">
                  {item.value.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
