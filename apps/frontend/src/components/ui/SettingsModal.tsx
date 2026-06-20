'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Globe, MessageSquare, Shield, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [responseLength, setResponseLength] = useState<'concise' | 'normal' | 'detailed'>('normal');
  const [citationMode, setCitationMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [uploadNotifications, setUploadNotifications] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      document.body.style.overflow = 'hidden';
      firstFocusableRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      saveSettings();
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
    if (typeof window === 'undefined') return;
    const savedDarkMode = localStorage.getItem('settings-darkMode');
    const savedLanguage = localStorage.getItem('settings-language');
    const savedSidebarCollapsed = localStorage.getItem('settings-sidebarCollapsed');
    const savedResponseLength = localStorage.getItem('settings-responseLength');
    const savedCitationMode = localStorage.getItem('settings-citationMode');
    const savedEmailNotifications = localStorage.getItem('settings-emailNotifications');
    const savedSystemNotifications = localStorage.getItem('settings-systemNotifications');
    const savedUploadNotifications = localStorage.getItem('settings-uploadNotifications');

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedSidebarCollapsed !== null) setSidebarCollapsed(savedSidebarCollapsed === 'true');
    if (savedResponseLength) setResponseLength(savedResponseLength as 'concise' | 'normal' | 'detailed');
    if (savedCitationMode !== null) setCitationMode(savedCitationMode === 'true');
    if (savedEmailNotifications !== null) setEmailNotifications(savedEmailNotifications === 'true');
    if (savedSystemNotifications !== null) setSystemNotifications(savedSystemNotifications === 'true');
    if (savedUploadNotifications !== null) setUploadNotifications(savedUploadNotifications === 'true');
  }, []);

  const loadSettings = () => {
    // Already handled above via useEffect
  };

  const saveSettings = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('settings-darkMode', String(darkMode));
    localStorage.setItem('settings-language', language);
    localStorage.setItem('settings-sidebarCollapsed', String(sidebarCollapsed));
    localStorage.setItem('settings-responseLength', responseLength);
    localStorage.setItem('settings-citationMode', String(citationMode));
    localStorage.setItem('settings-emailNotifications', String(emailNotifications));
    localStorage.setItem('settings-systemNotifications', String(systemNotifications));
    localStorage.setItem('settings-uploadNotifications', String(uploadNotifications));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="settings-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Settings
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex max-h-[70vh]">
          <nav className="w-48 border-r border-slate-200 dark:border-slate-700 p-4 space-y-1 overflow-y-auto">
            {[
              { id: 'general', label: 'General', icon: Globe },
              { id: 'ai', label: 'AI Settings', icon: MessageSquare },
              { id: 'notifications', label: 'Notifications', icon: Shield },
              { id: 'account', label: 'Account', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">General Settings</h3>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark/Light Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Toggle interface theme</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      darkMode ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={darkMode}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        darkMode ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sidebar collapsed by default</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Start with collapsed sidebar</p>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={sidebarCollapsed}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        sidebarCollapsed ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred language</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">AI Settings</h3>

                <div className="py-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Response Length</p>
                  <div className="flex gap-2">
                    {(['concise', 'normal', 'detailed'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => setResponseLength(length)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                          responseLength === length
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        )}
                      >
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Citation Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Show citations in responses</p>
                  </div>
                  <button
                    onClick={() => setCitationMode(!citationMode)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      citationMode ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={citationMode}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        citationMode ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Notification Settings</h3>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={emailNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        emailNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">System Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">In-app system alerts</p>
                  </div>
                  <button
                    onClick={() => setSystemNotifications(!systemNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      systemNotifications ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={systemNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        systemNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alerts when uploads complete</p>
                  </div>
                  <button
                    onClick={() => setUploadNotifications(!uploadNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      uploadNotifications ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={uploadNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                        uploadNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Account Settings</h3>

                <div className="space-y-3">
                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span>Change password</span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span>Security settings</span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span>Two-factor authentication</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};