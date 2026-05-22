import React, { useState } from 'react';
import { Stethoscope, Send, Sparkles, AlertCircle, HelpCircle, Activity, HeartPulse } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MEDICAL_CATEGORIES } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const QueryPage: React.FC = () => {
  const { addMedicalQuery, t } = useAppStore();
  
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState(MEDICAL_CATEGORIES[1]); // Cardiology default
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
  const [patientContext, setPatientContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleQueries = [
    {
      text: 'What is the latest clinical consensus on initiating SGLT2 inhibitors for Heart Failure with Preserved Ejection Fraction (HFpEF) in patients with eGFR between 25-30 mL/min?',
      category: 'Cardiology',
      urgency: 'Routine',
      context: '68yo female, NYHA Class III HFpEF (LVEF 54%), Type 2 Diabetes, CKD Stage 4 (eGFR 28 mL/min/1.73m²).'
    },
    {
      text: 'Management protocol for suspected Immune Checkpoint Inhibitor (ICI) induced myocarditis in a patient receiving Pembrolizumab for metastatic melanoma.',
      category: 'Oncology',
      urgency: 'Emergency',
      context: '54yo male, metastatic cutaneous melanoma on Pembrolizumab cycle 4. Presented with acute dyspnea, chest pain, troponin T elevation.'
    },
    {
      text: 'What are the risks and clinical protocols for combining Vedolizumab and Ustekinumab in severe refractory Crohn\'s disease?',
      category: 'Immunology',
      urgency: 'Routine',
      context: '32yo male, severe ileocolonic Crohn\'s disease refractory to Infliximab, Adalimumab, and monotherapy Vedolizumab.'
    },
  ];

  const handleApplySample = (sample: typeof sampleQueries[0]) => {
    setQueryText(sample.text);
    setCategory(sample.category);
    setUrgency(sample.urgency as any);
    setPatientContext(sample.context);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addMedicalQuery(queryText, category, urgency, patientContext);
      setIsSubmitting(false);
      // reset form
      setQueryText('');
      setPatientContext('');
    }, 1200); // simulate RAG pipeline latency
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <HeartPulse size={280} />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-300" /> Enterprise Medical AI Platform
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">
            NileoPedia Clinical Query System
          </h1>
          <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
            Harnessing Next.js, Express, Python AI microservices, PostgreSQL, and Pinecone vector stores to generate verified, citation-backed medical responses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Query Form */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="text-blue-600 dark:text-blue-500" size={22} />
              New Clinical RAG Query
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Express API + Pinecone Vector Store
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('query.placeholder').split('(')[0]}
              </label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={t('query.placeholder')}
                rows={4}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('query.category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-4 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {MEDICAL_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Urgency Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('query.urgency')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Routine', 'Urgent', 'Emergency'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setUrgency(urg)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all duration-200 ${
                        urgency === urg
                          ? urg === 'Emergency'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/20'
                            : urg === 'Urgent'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20'
                            : 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Context / Vitals */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t('query.patient_context')}
              </label>
              <Input
                value={patientContext}
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="e.g., 68yo female, NYHA Class III HFpEF, BP 132/84, HR 78 bpm, eGFR 28 mL/min..."
                icon={<Activity size={18} />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold justify-center gap-2 shadow-lg shadow-blue-500/20 py-3.5"
              disabled={isSubmitting || !queryText.trim()}
            >
              {isSubmitting ? (
                <>
                  <Activity size={20} className="animate-spin" />
                  Orchestrating Pinecone RAG Search...
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t('query.submit')}
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Sidebar Suggestions */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-blue-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-600 dark:text-blue-400" />
              {t('query.suggestions')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click any clinical case below to populate the query simulator instantly:
            </p>

            <div className="space-y-3">
              {sampleQueries.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplySample(sample)}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {sample.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sample.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {sample.urgency}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {sample.text}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
                    Context: {sample.context}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertCircle size={16} /> Clinical AI Notice
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
              All responses generated by the Python AI microservice are cross-referenced with Pinecone embeddings and require human validation by an assigned Medical Lead before institutional clinical deployment.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
