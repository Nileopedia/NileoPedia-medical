'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AppLayout } from '../../components/layout/AppLayout';
import { cn } from '../../utils/cn';
import { Globe, MessageSquare, Shield, User, Lock, ChevronRight, Clock, Monitor } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

type SettingsTab = 'general' | 'ai' | 'notifications' | 'account';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast();

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
    } catch (error) {
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
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to enable 2FA' });
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
    } catch (error) {
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
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to disable 2FA' });
    } finally {
      setTwoFactorLoading(false);
    }
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
                        onClick={() => updateSettings('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.theme === 'dark'}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                            settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
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
                        onChange={(e) => updateSettings('language', e.target.value as 'en' | 'am' | 'om')}
                        className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <option value="en">English</option>
                        <option value="am">Amharic</option>
                        <option value="om">Oromo</option>
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
                            onClick={() => updateSettings('responseStyle', length)}
                            className={cn(
                              'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                              settings.responseStyle === length
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
                        onClick={() => updateSettings('citationEnabled', !settings.citationEnabled)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.citationEnabled ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.citationEnabled}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
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

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Validation Notifications</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Alerts for validation tasks</p>
                      </div>
                      <button
                        onClick={() => updateSettings('validationNotifications', !settings.validationNotifications)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          settings.validationNotifications ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                        role="switch"
                        aria-checked={settings.validationNotifications}
                      >
                        <span
                          className={cn(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
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
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Change Password</h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                        />
                        <button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !currentPassword || !newPassword}
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Security Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Last login</span>
                          <span className="text-slate-700 dark:text-slate-300">{lastLogin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Active sessions</span>
                          <span className="text-slate-700 dark:text-slate-300">{activeSessions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Two-Factor Authentication</h4>
                      {!twoFactorEnabled && !showQrCode && (
                        <button
                          onClick={handleEnable2FA}
                          disabled={twoFactorLoading}
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                            maxLength={6}
                          />
                          <button
                            onClick={handleVerify2FA}
                            disabled={twoFactorLoading || otpCode.length < 6}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
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