'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/utils/cn';
import { Globe, MessageSquare, Shield, User, Check, Monitor, Moon, Sun } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/appStore';

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';
type ThemeType = 'light' | 'dark' | 'system';

interface Settings {
  theme: ThemeType;
  language: string;
  sidebarCollapsed: boolean;
  responseStyle: string;
  citationEnabled: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  uploadNotifications: boolean;
  validationNotifications: boolean;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  sidebarCollapsed: false,
  responseStyle: 'normal',
  citationEnabled: true,
  emailNotifications: true,
  systemNotifications: true,
  uploadNotifications: true,
  validationNotifications: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { toggleSidebar } = useAppStore();

  useEffect(() => {
    loadSettings();
  }, []);

const loadSettings = async () => {
     setLoading(true);
     try {
       const response = await api.request<{ success: boolean; data: Settings }>('/users/preferences');
       setSettings(response.data);
       if (response.data.sidebarCollapsed) {
         toggleSidebar();
       }
     } catch {
       addToast({ type: 'error', title: 'Failed to load settings' });
     } finally {
       setLoading(false);
     }
   };

   const saveSettings = async () => {
     try {
       await api.request('/users/preferences', {
         method: 'PUT',
         body: JSON.stringify(settings),
       });
       addToast({ type: 'success', title: 'Settings saved successfully' });
     } catch {
       addToast({ type: 'error', title: 'Failed to save settings' });
     }
   };

  const updateSetting = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }
    setChangingPassword(true);
    try {
      await api.request('/users/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      addToast({ type: 'success', title: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      addToast({ type: 'error', title: 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const ThemePreview = ({ theme }: { theme: ThemeType }) => {
    const isSelected = settings.theme === theme;
    const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

    return (
      <button
        onClick={() => {
          updateSetting('theme', theme);
          saveSettings();
        }}
        className={cn(
          'flex-1 p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 text-left',
          isSelected ? 'border-blue-500 shadow-md' : 'border-border hover:border-muted-foreground',
          theme === 'light' && 'bg-card',
          theme === 'dark' && 'bg-muted',
          theme === 'system' && 'bg-gradient-to-br from-card to-muted'
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Icon size={16} className="text-foreground" />
          <span className="text-xs sm:text-sm font-medium capitalize text-foreground">
            {theme}
          </span>
          {isSelected && <Check size={14} className="text-blue-500 ml-auto" />}
        </div>
        <div className={cn('h-10 sm:h-12 rounded border', theme === 'light' ? 'bg-muted border-border' : 'bg-border border-muted-foreground')}>
          <div className={cn('h-5 sm:h-6 mx-1.5 sm:mx-2 mt-1.5 sm:mt-2 rounded-sm', theme === 'light' ? 'bg-primary w-1/2' : 'bg-primary w-1/3')} />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 text-sm sm:text-base">Loading settings...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 transition-colors duration-300">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your application preferences</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <nav className="w-full sm:w-56 flex-shrink-0 space-y-1">
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
                  'w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors duration-300',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  {activeTab === 'general' && 'General Settings'}
                  {activeTab === 'ai' && 'AI Settings'}
                  {activeTab === 'notifications' && 'Notification Settings'}
                  {activeTab === 'account' && 'Account Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {activeTab === 'general' && (
                  <>
                    <div className="py-2.5 sm:py-3">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Theme</p>
                      <p className="text-xs text-muted-foreground mb-2 sm:mb-3">Choose your interface appearance</p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <ThemePreview theme="light" />
                        <ThemePreview theme="dark" />
                        <ThemePreview theme="system" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Language</p>
                        <p className="text-xs text-muted-foreground">Select your preferred language</p>
                      </div>
                      <select
                        value={settings.language}
                        onChange={(e) => {
                          updateSetting('language', e.target.value);
                          saveSettings();
                        }}
                        className="text-xs sm:text-sm border border-border rounded-lg px-2 py-1 bg-input text-foreground"
                      >
                        <option value="en">English</option>
                        <option value="am">Amharic</option>
                        <option value="om">Oromo</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Sidebar collapsed</p>
                        <p className="text-xs text-muted-foreground">Start with collapsed sidebar</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('sidebarCollapsed', !settings.sidebarCollapsed);
                          if (!settings.sidebarCollapsed) toggleSidebar();
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.sidebarCollapsed ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.sidebarCollapsed}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.sidebarCollapsed ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'ai' && (
                  <>
                    <div className="py-2.5 sm:py-3">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Response Length</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {(['concise', 'normal', 'detailed'] as const).map((length) => (
                          <button
                            key={length}
                            onClick={() => {
                              updateSetting('responseStyle', length);
                              saveSettings();
                            }}
                            className={cn(
                              'px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs rounded-lg border transition-colors duration-300',
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

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Citation Mode</p>
                        <p className="text-xs text-muted-foreground">Show citations in responses</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('citationEnabled', !settings.citationEnabled);
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.citationEnabled ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.citationEnabled}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.citationEnabled ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'notifications' && (
                  <>
                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('emailNotifications', !settings.emailNotifications);
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.emailNotifications ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.emailNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.emailNotifications ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">System Notifications</p>
                        <p className="text-xs text-muted-foreground">In-app system alerts</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('systemNotifications', !settings.systemNotifications);
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.systemNotifications ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.systemNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.systemNotifications ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Upload Notifications</p>
                        <p className="text-xs text-muted-foreground">Alerts when uploads complete</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('uploadNotifications', !settings.uploadNotifications);
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.uploadNotifications ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.uploadNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.uploadNotifications ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-2.5 sm:py-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">Validation Notifications</p>
                        <p className="text-xs text-muted-foreground">Alerts for validation tasks</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('validationNotifications', !settings.validationNotifications);
                          saveSettings();
                        }}
                        className={cn(
                          'relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors duration-300',
                          settings.validationNotifications ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={settings.validationNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform duration-300',
                            settings.validationNotifications ? 'translate-x-5 sm:translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">Change Password</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input text-foreground"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input text-foreground"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-xs sm:text-sm bg-input text-foreground"
                        />
                        <button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !currentPassword || !newPassword}
                          className="px-4 py-2 text-xs sm:text-sm text-primary-foreground bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity duration-300 w-full sm:w-auto"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
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