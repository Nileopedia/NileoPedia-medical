'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, Settings, Menu, ArrowRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAppStore } from '../../store/appStore';
import { NotificationPanel } from '../ui/NotificationPanel';
import { HelpModal } from '../ui/HelpModal';
import { SettingsModal } from '../ui/SettingsModal';
import { ProfileDropdown } from '../ui/ProfileDropdown';

type AppRouterInstance = {
  push: (href: string) => void;
  refresh: () => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => void;
};

export const Navbar: React.FC = () => {
  const { user, toggleMobileNav, notifications, markNotificationRead, clearNotifications } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [router, setRouter] = useState<AppRouterInstance | null>(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setHelpOpen(true);
      }
      if (e.key === 'Escape') {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const closeDropdowns = () => {
      setNotificationOpen(false);
      setProfileOpen(false);
    };
    if (helpOpen || settingsOpen) closeDropdowns();
  }, [helpOpen, settingsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleMobileNav}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
          <div className="relative max-w-xl w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
                className="w-full pl-10 pr-20 py-2 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                aria-label="Search medical topics"
              />
              <kbd className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 z-50 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={clearNotifications}
                  onClose={() => setNotificationOpen(false)}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setHelpOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="ml-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
            >
              <Avatar name={user?.name || 'User'} size="md" />
            </button>
            {profileOpen && user && (
              <div className="absolute right-0 mt-2 w-64 z-50 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <ProfileDropdown
                  userName={user.name}
                  userEmail={user.email}
                  userRole={user.role}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};