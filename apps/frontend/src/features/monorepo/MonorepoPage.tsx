import React, { useState } from 'react';
import { Network, Folder, File, ChevronRight, ChevronDown, Cpu, Layers, Server, ShieldCheck, Database, Terminal } from 'lucide-react';
import { MONOREPO_TREE, MonorepoNode } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const TreeNode: React.FC<{ node: MonorepoNode; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);

  return (
    <div className="space-y-1">
      <div 
        onClick={() => node.children && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
          depth === 0 ? 'bg-slate-50 dark:bg-slate-800/50 font-bold border border-slate-200/60 dark:border-slate-700/60' : ''
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
      >
        {node.children ? (
          isOpen ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        
        {node.type === 'dir' ? (
          <Folder size={16} className="text-blue-500 shrink-0" />
        ) : (
          <File size={16} className="text-slate-400 shrink-0" />
        )}

        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{node.name}</span>

        {node.tech && (
          <Badge variant="purple" size="sm" className="ml-2 font-sans font-normal">
            {node.tech}
          </Badge>
        )}

        {node.description && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate ml-auto font-sans pl-2">
            {node.description}
          </span>
        )}
      </div>

      {isOpen && node.children && (
        <div className="space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5 pl-1">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MonorepoPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center font-bold">
            <Network size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              NileoPedia Production Monorepo Structure
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive explorer of the enterprise microservice architecture and shared packages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Terminal size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
            pnpm-workspace.yaml + Turborepo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monorepo Tree View */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="text-blue-600 dark:text-blue-500" size={20} />
              Repository File Tree
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Click directories to expand/collapse</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            {MONOREPO_TREE.map((node, idx) => (
              <TreeNode key={idx} node={node} depth={0} />
            ))}
          </div>
        </Card>

        {/* Architectural Explanations */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900 dark:to-slate-800 border border-emerald-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu size={18} className="text-emerald-600 dark:text-emerald-400" />
              Microservice Architecture Flow
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              NileoPedia decouples the presentation layer from the heavy AI vector search to ensure sub-second response times and high availability.
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Server size={14} /> Next.js Frontend (App Router)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Handles user authentication, clinical query forms, medical markdown rendering, and live state sync with Zustand.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <Database size={14} /> Express Backend API + Prisma
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Acts as the primary API gateway, rate-limiting requests, verifying JWT tokens, and writing validation logs to PostgreSQL.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Cpu size={14} /> Python AI / RAG Microservice
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Executes dense vector search in Pinecone, synthesizes evidence with GPT-4o, and performs automated contradiction detection.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3 bg-slate-900 text-white border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" /> Enterprise Scalability
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shared UI packages (<code>@nileopedia/ui</code>) and TypeScript definitions (<code>@nileopedia/types</code>) guarantee absolute type safety across both Node.js and Python boundaries via OpenAPI schemas.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
