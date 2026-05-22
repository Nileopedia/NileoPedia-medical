import React, { useState } from 'react';
import { History, Search, ArrowRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const HistoryPage: React.FC = () => {
  const { queries, setSelectedQuery } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueries = queries.filter(q => 
    q.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.patientContext && q.patientContext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Medical Query Audit History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive search history and validation audit trails backed by PostgreSQL.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-full sm:w-96">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by query text, category, or patient context..."
              icon={<Search size={18} />}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
            Showing {filteredQueries.length} of {queries.length} total queries
          </span>
        </div>

        {filteredQueries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No medical queries matching your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQueries.map((q) => (
              <div 
                key={q.id}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 hover:border-blue-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{q.category}</Badge>
                    <Badge variant={
                      q.urgency === 'Emergency' ? 'error' : q.urgency === 'Urgent' ? 'warning' : 'secondary'
                    } size="sm">
                      {q.urgency}
                    </Badge>
                    <Badge variant={
                      q.validationStatus === 'Validated' ? 'success' : q.validationStatus === 'Rejected' ? 'error' : 'warning'
                    } size="sm">
                      {q.validationStatus}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={12} /> {new Date(q.timestamp).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {q.query}
                </h3>

                {q.patientContext && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    Context: {q.patientContext}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    {q.validationStatus === 'Validated' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500" />
                    )}
                    <span>
                      {q.validatedBy ? `Reviewed by ${q.validatedBy}` : 'Pending formal medical review'}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedQuery(q.id)}
                    className="font-bold gap-1.5 self-end sm:self-auto"
                  >
                    View RAG Response <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
