'use client';

import React, { useEffect, useRef } from 'react';
import { X, Globe, MessageSquare, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('general');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const { settings, updateSettings } = useSettings();
  const { setTheme } = useTheme();

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

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings('theme', theme);
    setTheme(theme);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div
        ref={modalRef}
        className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="settings-title" className="text-lg font-semibold text-foreground">
            Settings
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex max-h-[70vh]">
          <nav className="w-48 border-r border-border p-4 space-y-1 overflow-y-auto">
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
                  'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-300',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
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
                <h3 className="text-sm font-semibold text-foreground mb-4">General Settings</h3>
                
<div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground">Interface appearance</p>
                  </div>
                  <div className="flex gap-1">
                    {(['light', 'dark', 'system'] as const).map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => handleThemeChange(themeOption)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-lg border transition-colors duration-300',
                          settings.theme === themeOption
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        )}
                      >
                        {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Language</p>
                    <p className="text-xs text-muted-foreground">Select your preferred language</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings('language', e.target.value as 'en' | 'am' | 'om')}
                    className="text-sm border border-border rounded-lg px-2 py-1 bg-input text-foreground"
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="om">Oromo</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sidebar collapsed</p>
                    <p className="text-xs text-muted-foreground">Start with collapsed sidebar</p>
                  </div>
                  <button
                    onClick={() => updateSettings('sidebarCollapsed', !settings.sidebarCollapsed)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.sidebarCollapsed ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.sidebarCollapsed}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.sidebarCollapsed ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">AI Settings</h3>

                <div className="py-3">
                  <p className="text-sm font-medium text-foreground mb-2">Response Length</p>
                  <div className="flex gap-2">
                    {(['concise', 'normal', 'detailed'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => updateSettings('responseStyle', length)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-lg border transition-colors duration-300',
                          settings.responseStyle === length
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        )}
                      >
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Citation Mode</p>
                    <p className="text-xs text-muted-foreground">Show citations in responses</p>
                  </div>
                  <button
                    onClick={() => updateSettings('citationEnabled', !settings.citationEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.citationEnabled ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.citationEnabled}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.citationEnabled ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Notification Settings</h3>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => updateSettings('emailNotifications', !settings.emailNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.emailNotifications ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.emailNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.emailNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">System Notifications</p>
                    <p className="text-xs text-muted-foreground">In-app system alerts</p>
                  </div>
                  <button
                    onClick={() => updateSettings('systemNotifications', !settings.systemNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.systemNotifications ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.systemNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.systemNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Upload Notifications</p>
                    <p className="text-xs text-muted-foreground">Alerts when uploads complete</p>
                  </div>
                  <button
                    onClick={() => updateSettings('uploadNotifications', !settings.uploadNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.uploadNotifications ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.uploadNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.uploadNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Validation Notifications</p>
                    <p className="text-xs text-muted-foreground">Alerts for validation tasks</p>
                  </div>
                  <button
                    onClick={() => updateSettings('validationNotifications', !settings.validationNotifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
                      settings.validationNotifications ? 'bg-primary' : 'bg-slate-300'
                    )}
                    role="switch"
                    aria-checked={settings.validationNotifications}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                        settings.validationNotifications ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted"
                  >
                    <span>Change password</span>
                  </button>

                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted"
                  >
                    <span>Security settings</span>
                  </button>

                  <button
                    onClick={() => {}}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted"
                  >
                    <span>Two-factor authentication</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity duration-300"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};