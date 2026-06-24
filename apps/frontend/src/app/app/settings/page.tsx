'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/utils/cn';
import { Globe, MessageSquare, Shield, User, Check, Monitor, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from 'next-themes';

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';
type ThemeType = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast();
  const { setTheme, theme: currentTheme } = useTheme();

  const handleThemeChange = (theme: ThemeType) => {
    updateSettings('theme', theme);
    setTheme(theme);
  };

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Security info
  const [lastLogin] = useState('2024-06-15 14:30:00');
  const [activeSessions] = useState(1);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
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

  const handleEnable2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: { qrCodeUrl: string } }>('/auth/2fa/enable', {
        method: 'POST',
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setShowQrCode(true);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('404')) {
        addToast({ type: 'info', title: '2FA feature coming soon' });
      } else {
        addToast({ type: 'error', title: 'Failed to enable 2FA' });
      }
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setTwoFactorLoading(true);
    try {
      await api.request('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: otpCode }),
      });
      setTwoFactorEnabled(true);
      setShowQrCode(false);
      addToast({ type: 'success', title: '2FA enabled successfully' });
    } catch {
      addToast({ type: 'error', title: 'Invalid verification code' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorLoading(true);
    try {
      await api.request('/auth/2fa/disable', {
        method: 'POST',
      });
      setTwoFactorEnabled(false);
      addToast({ type: 'success', title: '2FA disabled' });
    } catch {
      addToast({ type: 'error', title: 'Failed to disable 2FA' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const ThemePreview = ({ theme }: { theme: ThemeType }) => {
    const isSelected = settings.theme === theme;
    const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
    
    return (
      <button
        onClick={() => handleThemeChange(theme)}
        className={cn(
          'flex-1 p-4 rounded-lg border-2 transition-all duration-300 text-left',
          isSelected ? 'border-blue-500 shadow-md' : 'border-border hover:border-slate-300',
          theme === 'light' && 'bg-white',
          theme === 'dark' && 'bg-slate-800',
          theme === 'system' && 'bg-gradient-to-br from-white to-slate-800'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon size={16} className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} />
          <span className={cn(
            'text-sm font-medium capitalize',
            theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
          )}>
            {theme}
          </span>
          {isSelected && <Check size={14} className="text-blue-500 ml-auto" />}
        </div>
        <div className={cn(
          'h-12 rounded border',
          theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-700 border-slate-600'
        )}>
          <div className={cn(
            'h-6 mx-2 mt-2 rounded-sm',
            theme === 'light' ? 'bg-blue-500 w-1/2' : 'bg-blue-400 w-1/3'
          )} />
        </div>
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your application preferences</p>
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
                  'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-300',
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-700/50'
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
                    <div className="py-3">
                      <p className="text-sm font-medium text-foreground mb-3">Theme</p>
                      <p className="text-xs text-muted-foreground mb-3">Choose your interface appearance</p>
                      <div className="grid grid-cols-3 gap-3">
                        <ThemePreview theme="light" />
                        <ThemePreview theme="dark" />
                        <ThemePreview theme="system" />
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
                          settings.sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-300'
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
                  </>
                )}

                {activeTab === 'ai' && (
                  <>
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
                                ? 'bg-primary text-primary-foreground border-blue-600'
                                : 'bg-card text-foreground border-border hover:bg-slate-100 dark:hover:bg-slate-700'
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
                  </>
                )}

                {activeTab === 'notifications' && (
                  <>
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
                  </>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                        />
                        <button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !currentPassword || !newPassword}
                          className="px-4 py-2 text-sm text-primary-foreground bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity duration-300"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-3">Security Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last login</span>
                          <span className="text-foreground">{lastLogin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active sessions</span>
                          <span className="text-foreground">{activeSessions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-3">Two-Factor Authentication</h4>
                      {!twoFactorEnabled && !showQrCode && (
                        <button
                          onClick={handleEnable2FA}
                          disabled={twoFactorLoading}
                          className="px-4 py-2 text-sm text-primary-foreground bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity duration-300"
                        >
                          Enable 2FA
                        </button>
                      )}
                      {showQrCode && (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                          </div>
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                            maxLength={6}
                          />
                          <button
                            onClick={handleVerify2FA}
                            disabled={twoFactorLoading || otpCode.length < 6}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity duration-300"
                          >
                            {twoFactorLoading ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      )}
                      {twoFactorEnabled && (
                        <div className="space-y-3">
                          <p className="text-sm text-green-600">2FA is enabled</p>
                          <button
                            onClick={handleDisable2FA}
                            disabled={twoFactorLoading}
                            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                          >
                            Disable 2FA
                          </button>
                        </div>
                      )}
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