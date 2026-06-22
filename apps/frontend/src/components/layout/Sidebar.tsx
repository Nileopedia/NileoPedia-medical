'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  MessageCircleQuestion,
  History,
  Bookmark,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  Users,
  Activity,
  Settings,
  User,
  LogOut,
  Bot,
  Menu,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAppStore } from '../../store/appStore';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, setUser, isSidebarOpen, toggleSidebar } = useAppStore();

  const getNavSections = () => {
    const sections: NavSection[] = [];
    
    if (user?.role === 'user') {
      sections.push({
        items: [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/app' },
          { icon: <MessageCircleQuestion size={18} />, label: 'Ask AI', path: '/ask' },
          { icon: <History size={18} />, label: 'Query History', path: '/history' },
          { icon: <Bookmark size={18} />, label: 'Saved Responses', path: '/saved' },
          { icon: <User size={18} />, label: 'Profile', path: '/app/profile' },
          { icon: <Settings size={18} />, label: 'Settings', path: '/app/settings' },
        ],
      });
    } else if (user?.role === 'validator') {
      sections.push(
        {
          items: [
            { icon: <ClipboardCheck size={18} />, label: 'Pending Reviews', path: '/validator', badge: 14 },
            { icon: <CheckCircle2 size={18} />, label: 'Approved Responses', path: '/validator/approved' },
            { icon: <XCircle size={18} />, label: 'Rejected Responses', path: '/validator/rejected' },
            { icon: <Clock size={18} />, label: 'Validation History', path: '/validator/history' },
            { icon: <FileText size={18} />, label: 'Feedback Reports', path: '/validator/feedback' },
          ],
        },
        {
          items: [
            { icon: <User size={18} />, label: 'Profile', path: '/validator/profile' },
            { icon: <Settings size={18} />, label: 'Settings', path: '/validator/settings' },
          ],
        }
      );
    } else if (user?.role === 'admin') {
      sections.push({
        items: [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin' },
          { icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
          { icon: <ClipboardCheck size={18} />, label: 'Validators', path: '/admin/validators' },
          { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/admin/analytics' },
          { icon: <Activity size={18} />, label: 'System Health', path: '/admin/system' },
          { icon: <Bot size={18} />, label: 'AI Activity', path: '/admin/ai-activity' },
          { icon: <FileText size={18} />, label: 'Documents', path: '/documents' },
          { icon: <FileText size={18} />, label: 'Logs', path: '/admin/logs' },
          { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
        ],
      });
    }
    return sections;
  };

  const navSections = getNavSections();

  return (
    <aside 
      className={cn(
        'bg-sidebar flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-border transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo / Hamburger Toggle */}
      <div className="px-3 py-4 border-b border-border flex items-center transition-colors duration-300">
        {isSidebarOpen ? (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <div className="transition-opacity duration-200">
              <h1 className="text-foreground font-bold text-base leading-tight">NileoPedia</h1>
              <p className="text-muted-foreground text-xs">Medical Intelligence Platform</p>
            </div>
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center py-2 hover:opacity-80 transition-opacity"
            aria-label="Expand sidebar"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {isSidebarOpen && section.title && (
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-200">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted hover:text-foreground',
                        !isSidebarOpen && 'justify-center px-2'
                      )}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      <span className={cn('flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && <span className="flex-1 transition-opacity duration-200">{item.label}</span>}
                      {isSidebarOpen && item.badge && (
                        <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-border p-3 transition-colors duration-300">
        {isSidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 transition-opacity duration-200">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || 'Medical User'}</p>
            </div>
          </div>
        )}
        {!isSidebarOpen && (
          <div className="flex justify-center mb-2" title={user?.name || 'User'}>
            <Avatar name={user?.name || 'User'} size="sm" />
          </div>
        )}
        <button
          onClick={() => setUser(null)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-foreground transition-all duration-200',
            !isSidebarOpen && 'justify-center px-2'
          )}
          title={!isSidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={18} className="text-muted-foreground" />
          {isSidebarOpen && <span className="flex-1 transition-opacity duration-200">Logout</span>}
        </button>
      </div>
    </aside>
  );
};