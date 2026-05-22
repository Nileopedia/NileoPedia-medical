import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  BookOpen, 
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ValidationDashboardPage: React.FC = () => {
  const { validationQueue, validateQuery, setSelectedQuery, currentUser } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Review' | 'Flagged'>('All');
  const [selectedQueueItem, setSelectedQueueItem] = useState<typeof validationQueue[0] | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const filteredQueue = validationQueue.filter(item => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  const handleOpenReview = (item: typeof validationQueue[0]) => {
    setSelectedQueueItem(item);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleAction = (status: 'Validated' | 'Rejected' | 'Requires Revision') => {
    if (!selectedQueueItem) return;
    validateQuery(selectedQueueItem.queryId, status, reviewNotes || `Reviewed by ${currentUser.name}`);
    setIsReviewModalOpen(false);
  };

  const handleInspectAIResponse = (queryId: string) => {
    setSelectedQuery(queryId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center font-bold">
            <FileCheck2 size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Clinical AI Validation Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review, verify, or flag automated RAG medical syntheses prior to patient-facing deployment.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto">
          {(['All', 'Pending', 'In Review', 'Flagged'] as const).map((status) => {
            const count = status === 'All' ? validationQueue.length : validationQueue.filter(q => q.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {status}
                <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Queue List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} /> Filtered Queue ({filteredQueue.length} items)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Assigned to: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
            </span>
          </div>

          {filteredQueue.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 dark:text-slate-400">
              No validation items matching the selected filter.
            </Card>
          ) : (
            filteredQueue.map((item) => (
              <Card key={item.id} className="p-6 space-y-4 hoverable transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{item.category}</Badge>
                    <Badge variant={
                      item.discrepancyRisk === 'High' ? 'error' : item.discrepancyRisk === 'Medium' ? 'warning' : 'success'
                    } size="sm">
                      Risk: {item.discrepancyRisk}
                    </Badge>
                    <Badge variant={
                      item.status === 'Pending' ? 'warning' : item.status === 'In Review' ? 'primary' : 'error'
                    } size="sm">
                      {item.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.queryText}
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      AI Generated Synthesis Summary:
                    </span>
                    <p className="line-clamp-3">{item.aiSummary}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <UserCheck size={14} className="text-blue-600 dark:text-blue-400" /> {item.assignedValidator}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" /> {item.citationsCount} Citations
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleInspectAIResponse(item.queryId)}
                      className="w-full sm:w-auto text-xs"
                    >
                      Full RAG View
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleOpenReview(item)}
                      className="w-full sm:w-auto text-xs font-bold gap-1.5"
                    >
                      Perform Review <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Validation Instructions Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
              Validator SOP & Guidelines
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              As an appointed Medical Lead on NileoPedia, your clinical validation directly impacts the Pinecone vector index weightings and institutional RAG retrieval quality.
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Verify Dosages:</strong> Check all mg/kg/day recommendations against latest FDA/EMA prescribing info.</span>
              </div>
              <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Check Contraindications:</strong> Ensure renal (eGFR) and hepatic adjustments are explicitly highlighted.</span>
              </div>
              <div className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Flag Hallucinations:</strong> Instantly reject any non-existent trial names or fabricated DOI links.</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-slate-900 text-white border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Security</span>
              <Badge variant="success" size="sm">Immutable Log</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every validation decision triggers a webhook to the Express Backend API, writing an immutable SHA-256 hash to the PostgreSQL audit table for regulatory medical AI compliance.
            </p>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Medical AI Validation Review"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleAction('Rejected')} className="font-bold">
              Reject / Flag Risk
            </Button>
            <Button variant="outline" onClick={() => handleAction('Requires Revision')} className="font-bold">
              Request AI Revision
            </Button>
            <Button variant="success" onClick={() => handleAction('Validated')} className="font-bold">
              Approve & Publish
            </Button>
          </>
        }
      >
        {selectedQueueItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">{selectedQueueItem.category}</Badge>
                <Badge variant="warning" size="sm">Confidence: {selectedQueueItem.confidenceScore}%</Badge>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {selectedQueueItem.queryText}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                {selectedQueueItem.aiSummary}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Clinical Validator Notes & Directive
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter clinical rationale, evidence corrections, or approval notes for the medical audit log..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <UserCheck size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
              <span>Reviewing under credentials: <strong>{currentUser.name} ({currentUser.title})</strong></span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
