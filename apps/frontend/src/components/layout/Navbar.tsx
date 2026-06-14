import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, Settings, Menu, ArrowRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAppStore } from '../../store/appStore';

export const Navbar: React.FC = () => {
  const { user, toggleMobileNav } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [router, setRouter] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      const { useRouter } = require('next/navigation');
      setRouter(useRouter());
    } catch {
      // Running outside Next.js context (tests)
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && router) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="relative max-w-xl w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search medical topics, questions, conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleSearch(e);
                }
              }}
              className="w-full pl-10 pr-20 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <kbd className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
              ⌘K
            </kbd>
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Search"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <div className="ml-2">
          <Avatar name={user?.name || 'User'} size="md" />
        </div>
      </div>
    </header>
  );
};
