'use client';

import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Clock, Eye } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

const history = [
  { id: '1', title: 'Hypertension guidelines', action: 'approved', date: '2 days ago', category: 'Cardiology' },
  { id: '2', title: 'Diabetes management', action: 'approved', date: '1 week ago', category: 'Endocrinology' },
];

export default function ValidatorHistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Validation History</h1>
          <p className="text-sm text-muted-foreground">Your validation activity log</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock size={18} className="text-blue-600" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell>
                      <Badge variant={item.action === 'approved' ? 'success' : 'default'} className="text-xs">
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.date}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-primary hover:text-primary/80" title="View details">
                        <Eye size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}