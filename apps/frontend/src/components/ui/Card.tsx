import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glass';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200 overflow-hidden';
  
  const variants = {
    default: 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800',
    bordered: 'bg-transparent border-2 border-slate-200 dark:border-slate-800 shadow-none',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm',
  };

  const hoverStyles = hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5' : '';

  return (
    <div
      className={cn(baseStyles, variants[variant], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};
