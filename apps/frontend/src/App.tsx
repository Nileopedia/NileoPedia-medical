import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/navigation/Sidebar';
import { Topbar } from './components/navigation/Topbar';
import { QueryPage } from './features/medical-query/QueryPage';
import { AIResponsePage } from './features/ai-response/AIResponsePage';
import { ValidationDashboardPage } from './features/validation/ValidationDashboardPage';
import { CitationsPage } from './features/citations/CitationsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { HistoryPage } from './features/history/HistoryPage';
import { MonorepoPage } from './features/monorepo/MonorepoPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const { currentTab, toastMessage, clearToast } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'query':
        return <QueryPage />;
      case 'ai_response':
        return <AIResponsePage />;
      case 'validation':
        return <ValidationDashboardPage />;
      case 'citations':
        return <CitationsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'history':
        return <HistoryPage />;
      case 'monorepo':
        return <MonorepoPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <QueryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all duration-300 ease-in-out">
        <Topbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Global Footer */}
        <footer className="h-14 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between px-6 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div>
            <strong>NileoPedia AI RAG Platform</strong> — Production Monorepo v2.4.0
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>Next.js 15 App Router</span>
            <span>Express API Gateway</span>
            <span>Python AI Microservices</span>
            <span>Pinecone + PostgreSQL</span>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 animate-slideUp">
          <CheckCircle2 size={20} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          <button 
            onClick={clearToast}
            className="p-1 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors ml-2"
            aria-label="Close Toast"
          >
            <X size={16} className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
