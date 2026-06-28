import React from 'react';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
  className,
}) => {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-4 sm:p-5 shadow-sm w-full', className)}>
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{value}</p>
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
          {subtitle && <span className="text-xs text-muted-foreground/70 ml-1">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};