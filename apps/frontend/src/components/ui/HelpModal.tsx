'use client';

import React, { useEffect, useRef } from 'react';
import { X, FileText, Search as SearchIcon, History, Bookmark, HelpCircle, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpSections = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    icon: SearchIcon,
    items: [
      { icon: FileText, text: 'Upload medical documents' },
      { icon: SearchIcon, text: 'Ask AI questions' },
      { icon: History, text: 'View query history' },
      { icon: Bookmark, text: 'Save responses' },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    items: [
      { icon: HelpCircle, text: 'How does AI search work?' },
      { icon: FileText, text: 'What document formats are supported?' },
      { icon: SearchIcon, text: 'How are citations generated?' },
      { icon: FileText, text: 'How can admins upload content?' },
    ],
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      firstFocusableRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden transform transition-all duration-300 ease-out"
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="help-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Help & Support
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close help"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          {helpSections.map((section) => (
            <div key={section.id} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <section.icon size={16} className="text-blue-600" />
                <h3 className="font-medium text-slate-900 dark:text-slate-50">{section.title}</h3>
              </div>
              <ul className="space-y-2 pl-6">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <item.icon size={14} className="text-slate-400" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={16} className="text-blue-600" />
              <h3 className="font-medium text-slate-900 dark:text-slate-50">Shortcuts</h3>
            </div>
            <ul className="space-y-2 pl-6">
              <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded">Ctrl + K</kbd>
                <span className="ml-2">→ Search</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded">Ctrl + /</kbd>
                <span className="ml-2">→ Help</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Documentation
              </a>
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Contact support
              </a>
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Report issue
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};