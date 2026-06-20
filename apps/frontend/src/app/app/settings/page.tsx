'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AppLayout } from '../../components/layout/AppLayout';
import { cn } from '../../utils/cn';
import { Globe, MessageSquare, Shield, User, Lock, ChevronRight } from 'lucide-react';

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';

interface Settings {
  darkMode: boolean;
  language: string;
  sidebarCollapsed: boolean;
  responseLength: 'concise' | 'normal' | 'detailed';
  citationMode: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  uploadNotifications: boolean;
}

const defaultSettings: Settings = {
  darkMode: false,
  language: 'en',
  sidebarCollapsed: false,
  responseLength: 'normal',
  citationMode: true,
  emailNotifications: true,
  systemNotifications: true,
  uploadNotifications: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure your application preferences</p>
        </div>

        <div className="flex gap-6">
          <nav className="w-56 flex-shrink-0 space-y-1">
            {[
              { id: 'general', label: 'General', icon: Globe },
              { id: 'ai', label: 'AI Settings', icon: MessageSquare },
              { id: 'notifications', label: 'Notifications', icon: Shield },
              { id: 'account', label: 'Account', icon: User },
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
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'general' && 'General Settings'}
                  {activeTab === 'ai' && 'AI Settings'}
                  {activeTab === 'notifications' && 'Notification Settings'}
                  {activeTab === 'account' && 'Account Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'general' && (
                  <>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Toggle interface theme</p>
                      </div>
                      <button
                        onClick={() => updateSettings('darkMode', !settings.darkMode)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.darkMode ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.darkMode}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.darkMode ? 'translate-x-5' : 'translate-x-1'
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
                        value={settings.language}
                        onChange={(e) => updateSettings('language', e.target.value)}
                        className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sidebar collapsed</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Start with collapsed sidebar</p>
                      </div>
                      <button
                        onClick={() => updateSettings('sidebarCollapsed', !settings.sidebarCollapsed)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.sidebarCollapsed}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.sidebarCollapsed ? 'translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'ai' && (
                  <>
                    <div className="py-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Response Length</p>
                      <div className="flex gap-2">
                        {(['concise', 'normal', 'detailed'] as const).map((length) => (
                          <button
                            key={length}
                            onClick={() => updateSettings('responseLength', length)}
                            className={cn(
                              'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                              settings.responseLength === length
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
                        onClick={() => updateSettings('citationMode', !settings.citationMode)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.citationMode ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.citationMode}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.citationMode ? 'translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'notifications' && (
                  <>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => updateSettings('emailNotifications', !settings.emailNotifications)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.emailNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.emailNotifications ? 'translate-x-5' : 'translate-x-1'
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
                        onClick={() => updateSettings('systemNotifications', !settings.systemNotifications)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.systemNotifications ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.systemNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.systemNotifications ? 'translate-x-5' : 'translate-x-1'
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
                        onClick={() => updateSettings('uploadNotifications', !settings.uploadNotifications)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.uploadNotifications ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.uploadNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.uploadNotifications ? 'translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <Lock size={16} />
                        <span>Change password</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <Shield size={16} />
                        <span>Security settings</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <User size={16} />
                        <span>Two-factor authentication</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}