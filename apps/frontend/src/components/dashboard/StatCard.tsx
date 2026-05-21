import React from 'react';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  className,
}) => {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm', className)}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">{value}</p>
      {change && (
        <div className="flex items-center gap-1">
          {changeType === 'positive' ? (
            <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight size={14} className="text-red-600 dark:text-red-400" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {change}
          </span>
          {subtitle && <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
