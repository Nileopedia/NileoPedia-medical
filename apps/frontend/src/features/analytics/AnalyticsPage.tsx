import React from 'react';
import { BarChart3, Activity, Zap, CheckCircle2, Award, Server } from 'lucide-react';
import { ANALYTICS_DATA, PERFORMANCE_METRICS } from '../../data/mockData';
import { Card } from '../../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const totalQueries = ANALYTICS_DATA.reduce((acc, curr) => acc + curr.queries, 0);
  const totalValidated = ANALYTICS_DATA.reduce((acc, curr) => acc + curr.validated, 0);
  const avgAccuracy = (ANALYTICS_DATA.reduce((acc, curr) => acc + curr.accuracy, 0) / ANALYTICS_DATA.length).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-500 flex items-center justify-center font-bold">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Platform Analytics & System Performance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time telemetry from Express API gateways, Pinecone vector stores, and PostgreSQL audit tables.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Queries</span>
            <Activity size={20} />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {totalQueries.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Across all 6 clinical domains
          </p>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 border border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Validation Rate</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {((totalValidated / totalQueries) * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalValidated.toLocaleString()} queries clinically approved
          </p>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-800/80 border border-purple-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">RAG Accuracy</span>
            <Award size={20} />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {avgAccuracy}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Grounded vector relevance match
          </p>
        </Card>

        <Card className="p-6 space-y-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800/80 border border-amber-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
            <Zap size={20} />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            276 ms
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            End-to-end RAG response generation
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Breakdown Chart */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
              Medical Domain Query Distribution
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">PostgreSQL Aggregates</span>
          </div>

          <div className="space-y-4 pt-2">
            {ANALYTICS_DATA.map((item) => {
              const percentage = (item.queries / totalQueries) * 100;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span>{item.queries.toLocaleString()} queries</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Performance Over Time */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="text-purple-600 dark:text-purple-400" size={20} />
              Pinecone RAG Latency & Telemetry
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live Gateway Metrics</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
              <span>Timestamp</span>
              <span>Pipeline Latency</span>
              <span>Vector Hit Rate</span>
            </div>

            <div className="space-y-3">
              {PERFORMANCE_METRICS.map((metric, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{metric.time} UTC</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{metric.latencyMs} ms</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{metric.ragHitRate}%</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                <Server size={16} className="text-blue-600 dark:text-blue-400" /> Active AI Orchestration Nodes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold font-mono">16 Nodes Online</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
