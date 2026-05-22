import React, { useState } from 'react';
import { BookOpenCheck, Search, ExternalLink, Filter, ShieldCheck, Database } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const CitationsPage: React.FC = () => {
  const { citations } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Clinical Trial', 'Meta-Analysis', 'Guideline', 'Review'];

  const filteredCitations = citations.filter(cit => {
    const matchesSearch = cit.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cit.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cit.authors.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || cit.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold">
            <BookOpenCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              RAG Citations & Evidentiary Library
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live vector store synchronization with Pinecone embeddings and PubMed Central ingestion pipelines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Database size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Pinecone Index: <code className="text-purple-600 dark:text-purple-400">nileopedia-medical-v2</code>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Citations List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search citations by title, author, or medical snippet..."
                icon={<Search size={18} />}
              />
            </div>
            <div className="w-full sm:w-48 shrink-0">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-4 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-full"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t} Sources</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} /> Showing {filteredCitations.length} grounded sources
            </span>
          </div>

          {filteredCitations.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 dark:text-slate-400">
              No citations matching your search criteria.
            </Card>
          ) : (
            filteredCitations.map((cit) => (
              <Card key={cit.id} className="p-6 space-y-4 hoverable">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      cit.type === 'Guideline' ? 'purple' : cit.type === 'Clinical Trial' ? 'primary' : 'success'
                    } size="sm">
                      {cit.type}
                    </Badge>
                    <Badge variant="outline" size="sm">Year: {cit.year}</Badge>
                  </div>
                  <Badge variant="success" size="sm">
                    Relevance Score: {cit.relevanceScore}%
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <a href={cit.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 w-full">
                      {cit.title} <ExternalLink size={16} className="shrink-0 text-slate-400" />
                    </a>
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {cit.authors} — <strong className="text-slate-800 dark:text-slate-200">{cit.journal}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{cit.snippet}&rdquo;
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>DOI: {cit.doi}</span>
                  <span>PMID: {cit.pmid}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Citation Ingestion Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
              RAG Ingestion Pipeline
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              NileoPedia maintains a nightly automated ingestion pipeline built with Python and LangChain. 
            </p>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <strong>1. Document Chunking:</strong> Articles are split into 512-token chunks with 50-token overlap to maintain medical context.
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <strong>2. Embedding Generation:</strong> High-dimensional vector embeddings are computed via <code>text-embedding-3-large</code>.
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <strong>3. Pinecone Upsert:</strong> Vectors are indexed in Pinecone with metadata tags for domain filtering and PMID tracking.
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-900/40 text-purple-900 dark:text-purple-200">
            <h4 className="text-xs font-bold uppercase tracking-wider">Citation Integrity Rule</h4>
            <p className="text-xs leading-relaxed opacity-90">
              The AI is strictly prohibited from generating responses that lack a minimum relevance score of 85% in the Pinecone vector index. This eliminates clinical hallucination risks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
