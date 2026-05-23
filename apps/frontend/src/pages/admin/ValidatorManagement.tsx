import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Search, Mail, ShieldAlert, Ban } from 'lucide-react';

export const ValidatorManagement: React.FC = () => {
  const navigate = useNavigate();
  const validators = [
    { id: '1', name: 'Dr. Michael Chen', email: 'michael@example.com', specialty: 'Cardiology', status: 'active', approvalRate: '94%', reviews: 856 },
    { id: '2', name: 'Dr. Emily Davis', email: 'emily@example.com', specialty: 'Endocrinology', status: 'active', approvalRate: '89%', reviews: 642 },
    { id: '3', name: 'Dr. James Wilson', email: 'james@example.com', specialty: 'Neurology', status: 'pending', approvalRate: '0%', reviews: 0 },
    { id: '4', name: 'Dr. Ruth Adams', email: 'ruth@example.com', specialty: 'Oncology', status: 'suspended', approvalRate: '91%', reviews: 412 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'pending': return <Badge variant="warning">Pending Invite</Badge>;
      case 'suspended': return <Badge variant="danger">Suspended</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Validators</h1>
          <p className="text-slate-500">Manage medical validators, permissions, and performance.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/admin/validators/create')}>
          <Mail size={16} />
          Invite Validator
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search validators..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Validator</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Specialty</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Reviews</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Approval Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {validators.map((val) => (
                  <tr key={val.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={val.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{val.name}</p>
                          <p className="text-xs text-slate-500">{val.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{val.specialty}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{val.reviews.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{val.approvalRate}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(val.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {val.status === 'active' && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Ban size={14} className="mr-1" /> Suspend
                          </Button>
                        )}
                        {val.status === 'suspended' && (
                          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <ShieldAlert size={14} className="mr-1" /> Activate
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
