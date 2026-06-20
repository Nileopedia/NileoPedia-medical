import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isMobileNavOpen, toggleMobileNav, isSidebarOpen } = useAppStore();

  // Calculate main content margin based on sidebar state
  const mainMargin = isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      
      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleMobileNav}
        />
      )}

      {/* Mobile sidebar - slide-in drawer behavior */}
      <div
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-slate-900 z-30 transform transition-transform duration-300 lg:hidden',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex justify-end p-3">
          <button
            onClick={toggleMobileNav}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className={cn(mainMargin, 'transition-all duration-300 ease-in-out')}>
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};