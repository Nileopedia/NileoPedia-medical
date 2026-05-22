import React from 'react';
import { Menu, Sun, Moon, Globe, UserCheck, Bell, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_USER_ROLES, MOCK_LANGUAGES } from '../../data/mockData';

export const Topbar: React.FC<{ setMobileOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setMobileOpen }) => {
  const { darkMode, toggleDarkMode, language, setLanguage, currentUser, setCurrentUser, validationQueue } = useAppStore();

  const pendingCount = validationQueue.filter(q => q.status === 'Pending').length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>

        {/* Live Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Activity size={14} /> RAG Pipeline Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Selector dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <UserCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <select
            value={currentUser.id}
            onChange={(e) => setCurrentUser(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {MOCK_USER_ROLES.map(role => (
              <option key={role.id} value={role.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {role.name} ({role.title})
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Globe size={16} className="text-slate-600 dark:text-slate-400 shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {MOCK_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
