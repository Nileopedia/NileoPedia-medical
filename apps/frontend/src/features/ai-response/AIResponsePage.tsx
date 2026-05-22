import React, { useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  FileText, 
  BookOpen, 
  ExternalLink,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AIResponsePage: React.FC = () => {
  const { queries, selectedQueryId, setSelectedQuery, validateQuery, t, currentUser } = useAppStore();

  const activeQuery = queries.find(q => q.id === selectedQueryId) || queries[0];
  const [validatorNotes, setValidatorNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'Validated' | 'Rejected' | 'Requires Revision'>('Validated');

  if (!activeQuery) {
    return (
      <div className="p-12 text-center text-slate-500">
        No medical queries found. Submit a query first!
      </div>
    );
  }

  const handleOpenAction = (type: typeof actionType) => {
    setActionType(type);
    setValidatorNotes(activeQuery.validatorNotes || '');
    setIsModalOpen(true);
  };

  const handleConfirmAction = () => {
    validateQuery(activeQuery.id, actionType, validatorNotes);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Selector bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <BrainCircuit className="text-purple-600 dark:text-purple-400 shrink-0" size={24} />
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Response Viewer</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Select query to inspect RAG pipeline outputs</span>
          </div>
        </div>

        <div className="w-full md:w-96">
          <select 
            value={activeQuery.id}
            onChange={(e) => setSelectedQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {queries.map(q => (
              <option key={q.id} value={q.id}>
                [{q.category}] {q.query.substring(0, 60)}... ({q.validationStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Response Content */}
        <Card className="lg:col-span-2 p-6 lg:p-8 space-y-6">
          {/* Header details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">{activeQuery.category}</Badge>
                <Badge variant={
                  activeQuery.urgency === 'Emergency' ? 'error' : activeQuery.urgency === 'Urgent' ? 'warning' : 'secondary'
                } size="sm">
                  {activeQuery.urgency}
                </Badge>
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {activeQuery.query}
              </h1>
              {activeQuery.patientContext && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Patient Context & Vitals:</span>
                  {activeQuery.patientContext}
                </div>
              )}
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t('ai.confidence')}
              </span>
              <div className="flex items-baseline gap-1 text-purple-600 dark:text-purple-400 font-extrabold text-2xl">
                {activeQuery.confidenceScore}%
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">RAG Match</span>
              </div>
            </div>
          </div>

          {/* Validation Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            activeQuery.validationStatus === 'Validated'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : activeQuery.validationStatus === 'Rejected'
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
              : activeQuery.validationStatus === 'Requires Revision'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
          }`}>
            {activeQuery.validationStatus === 'Validated' ? (
              <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : activeQuery.validationStatus === 'Rejected' ? (
              <AlertTriangle size={22} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Clock size={22} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  Status: {activeQuery.validationStatus}
                </span>
                {activeQuery.validatedBy && (
                  <span className="text-xs opacity-90 font-medium">
                    by {activeQuery.validatedBy}
                  </span>
                )}
              </div>
              {activeQuery.validatorNotes ? (
                <p className="text-xs opacity-90 italic">
                  &ldquo;{activeQuery.validatorNotes}&rdquo;
                </p>
              ) : (
                <p className="text-xs opacity-80">
                  This AI synthesis is awaiting formal review by the assigned Medical Lead.
                </p>
              )}
            </div>
          </div>

          {/* AI Response Sections */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                Synthesized RAG Medical Output
              </h3>
              <span className="text-xs text-slate-400 font-medium">Model: GPT-4o + Pinecone Reranker</span>
            </div>

            {activeQuery.sections.map((sec) => (
              <div key={sec.id} className={`p-5 rounded-xl border space-y-3 ${
                sec.type === 'alert'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : sec.type === 'contraindications'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
              }`}>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {sec.type === 'alert' && <ShieldAlert size={16} className="text-rose-600" />}
                  {sec.title}
                </h4>

                {/* Simulated Markdown / Table rendering */}
                {sec.type === 'evidence_table' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-200/60 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-600">
                          <th className="p-2.5">Medication</th>
                          <th className="p-2.5">Target Dose</th>
                          <th className="p-2.5">Minimum eGFR</th>
                          <th className="p-2.5">Primary Trial</th>
                          <th className="p-2.5">NNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        <tr>
                          <td className="p-2.5 font-bold">Empagliflozin</td>
                          <td className="p-2.5">10 mg once daily</td>
                          <td className="p-2.5">20 mL/min/1.73m²</td>
                          <td className="p-2.5 font-semibold text-blue-600 dark:text-blue-400">EMPEROR-Preserved</td>
                          <td className="p-2.5">31 (over 2.1 yrs)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">Dapagliflozin</td>
                          <td className="p-2.5">10 mg once daily</td>
                          <td className="p-2.5">25 mL/min/1.73m²</td>
                          <td className="p-2.5 font-semibold text-blue-600 dark:text-blue-400">DELIVER</td>
                          <td className="p-2.5">32 (over 2.3 yrs)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {sec.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validator Action Bar */}
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <UserCheck size={18} className="text-blue-600 dark:text-blue-400" />
                Medical Lead Verification Panel
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Logged in as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              As an authorized medical validator, you can approve this RAG synthesis for institutional publication, request AI re-prompting, or flag clinical discrepancies.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="success"
                size="sm"
                icon={<ThumbsUp size={16} />}
                onClick={() => handleOpenAction('Validated')}
                className="font-bold shadow-sm"
              >
                Approve & Validate
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<ThumbsDown size={16} />}
                onClick={() => handleOpenAction('Rejected')}
                className="font-bold shadow-sm"
              >
                Reject / Flag Risk
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw size={16} />}
                onClick={() => handleOpenAction('Requires Revision')}
                className="font-bold shadow-sm"
              >
                Request AI Revision
              </Button>
            </div>
          </div>
        </Card>

        {/* Citations & Evidence Panel */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                RAG Citations ({activeQuery.citations.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pinecone DB</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The AI response above is grounded in the following peer-reviewed trials and guidelines:
            </p>

            <div className="space-y-4">
              {activeQuery.citations.map((cit) => (
                <div 
                  key={cit.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" size="sm">{cit.type}</Badge>
                    <Badge variant="success" size="sm">Match: {cit.relevanceScore}%</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {cit.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    {cit.authors} — {cit.journal} ({cit.year})
                  </p>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                    &ldquo;{cit.snippet}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    <span>PMID: {cit.pmid}</span>
                    <a 
                      href={cit.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      PubMed View <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-purple-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={16} /> Pinecone Vector Details
            </h4>
            <p className="text-xs text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
              Embeddings generated via <code>text-embedding-3-large</code> (3072 dimensions). Hybrid search combines sparse BM25 keyword matching with dense semantic similarity for medical accuracy.
            </p>
          </Card>
        </div>
      </div>

      {/* Validation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Confirm Validation Action: ${actionType}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'Validated' ? 'success' : actionType === 'Rejected' ? 'danger' : 'primary'}
              onClick={handleConfirmAction}
              className="font-bold"
            >
              Confirm & Save Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <span className="font-bold block text-slate-900 dark:text-slate-100">Query under review:</span>
            <p className="italic">&ldquo;{activeQuery.query}&rdquo;</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Add Clinical Validator Notes (Required for audit logs)
            </label>
            <textarea
              value={validatorNotes}
              onChange={(e) => setValidatorNotes(e.target.value)}
              placeholder="Explain your medical reasoning, point out specific guideline updates, or detail what the AI needs to revise..."
              rows={4}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            By confirming, your name ({currentUser.name}) and credential timestamp will be permanently written to the PostgreSQL audit table.
          </p>
        </div>
      </Modal>
    </div>
  );
};
