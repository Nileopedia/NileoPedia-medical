import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => (
  <div className="overflow-x-auto">
    <table className={cn('w-full text-sm', className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={cn('border-b border-slate-200 dark:border-slate-700', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={cn('hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors', className)} {...props}>
    {children}
  </tr>
);

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className, ...props }) => (
  <th className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider', className)} {...props}>
    {children}
  </th>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => (
  <td className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', className)} {...props}>
    {children}
  </td>
);