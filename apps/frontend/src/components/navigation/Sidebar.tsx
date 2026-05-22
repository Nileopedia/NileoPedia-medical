import React from 'react';
import { 
  Stethoscope, 
  BrainCircuit, 
  FileCheck2, 
  BookOpenCheck, 
  BarChart3, 
  History, 
  Network, 
  Settings, 
  ShieldAlert,
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { useAppStore, AppTab } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC<{ mobileOpen: boolean; setMobileOpen: (open: boolean) => void }> = ({
  mobileOpen,
  setMobileOpen
}) => {
  const { currentTab, setTab, validationQueue, t, currentUser } = useAppStore();

  const navItems: Array<{ id: AppTab; labelKey: string; icon: React.ReactNode; badge?: number | string; badgeColor?: any }> = [
    { id: 'query', labelKey: 'nav.query', icon: <Stethoscope size={20} /> },
    { id: 'ai_response', labelKey: 'nav.ai_response', icon: <BrainCircuit size={20} />, badge: 'Active', badgeColor: 'purple' },
    { 
      id: 'validation', 
      labelKey: 'nav.validation', 
      icon: <FileCheck2 size={20} />, 
      badge: validationQueue.filter(q => q.status === 'Pending').length,
      badgeColor: 'warning' 
    },
    { id: 'citations', labelKey: 'nav.citations', icon: <BookOpenCheck size={20} /> },
    { id: 'analytics', labelKey: 'nav.analytics', icon: <BarChart3 size={20} /> },
    { id: 'history', labelKey: 'nav.history', icon: <History size={20} /> },
    { id: 'monorepo', labelKey: 'nav.monorepo', icon: <Network size={20} />, badge: 'New', badgeColor: 'success' },
    { id: 'settings', labelKey: 'nav.settings', icon: <Settings size={20} /> },
  ];

  const handleNavClick = (id: AppTab) => {
    setTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header / Brand */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <HeartPulse size={24} className="animate-pulse" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-1.5">
              NileoPedia <Sparkles size={16} className="text-amber-500 shrink-0" />
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {t('app.subtitle')}
            </span>
          </div>
        </div>

        {/* User Role status */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Session</span>
            <Badge variant="success" size="sm">{currentUser.badge}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
              {currentUser.name.split(' ').map(n => n[0]).join('').replace('D', '')}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.department}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Clinical AI & RAG System
          </div>
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  active 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold shadow-sm border border-blue-100 dark:border-blue-800/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={cn(
                    'transition-colors duration-200', 
                    active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}>
                    {item.icon}
                  </span>
                  <span className="truncate">{t(item.labelKey)}</span>
                </div>
                {item.badge !== undefined && item.badge !== 0 && (
                  <Badge variant={item.badgeColor || 'primary'} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Security & HIPAA Compliance Notice */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start gap-3 mt-auto">
          <ShieldAlert size={20} className="text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">HIPAA & AI Compliant</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Encrypted Pinecone RAG Vector Store & Express Orchestrator.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
