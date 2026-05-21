import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { ValidationOverview } from '../components/dashboard/ValidationOverview';
import { RecentQueries } from '../components/dashboard/RecentQueries';
import { TopCategories } from '../components/dashboard/TopCategories';
import { mockActivities, mockQueries, mockCategoryStats, currentUser } from '../data/mockData';
import { ValidationStat } from '../types';
import { useAppStore } from '../store/appStore';

const validationStats: ValidationStat = {
  approved: 1034,
  pending: 214,
  rejected: 45,
  total: 1293,
  approvalRate: 82.9,
};

export const Dashboard: React.FC = () => {
  const { setUser } = useAppStore();

  React.useEffect(() => {
    setUser(currentUser);
  }, [setUser]);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
          Welcome back, Dr. Sarah 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400">What would you like to explore today?</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Queries"
          value="1,248"
          change="+12.5%"
          changeType="positive"
          subtitle="from last month"
        />
        <StatCard
          title="Approved Responses"
          value="1,034"
          change="82.9%"
          changeType="positive"
          subtitle="approval rate"
        />
        <StatCard
          title="Pending Validations"
          value="214"
          subtitle="Requires your review"
        />
        <StatCard
          title="Saved Responses"
          value="856"
          change="+18.2%"
          changeType="positive"
          subtitle="from last month"
        />
      </div>

      {/* Activity and Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={mockActivities} />
        <ValidationOverview stats={validationStats} />
      </div>

      {/* Categories */}
      <TopCategories categories={mockCategoryStats} />

      {/* Recent Queries */}
      <RecentQueries queries={mockQueries} />
    </div>
  );
};
