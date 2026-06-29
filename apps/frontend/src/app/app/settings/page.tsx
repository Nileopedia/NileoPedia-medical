'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/Input';
import { Loader2, Save, Lock, Bell, Palette, Brain } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/Toast';
import { useSettings } from '../../contexts/SettingsContext';
import { cn } from '../../utils/cn';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'am' | 'om';
type ResponseStyle = 'concise' | 'normal' | 'detailed';

interface SettingsState {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  uploadNotifications: boolean;
  validationNotifications: boolean;
  responseStyle: ResponseStyle;
  citationEnabled: boolean;
}

const Switch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    disabled={disabled}
    className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
      checked ? 'bg-primary' : 'bg-slate-300'
    )}
    role="switch"
    aria-checked={checked}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300',
        checked ? 'translate-x-5' : 'translate-x-1'
      )}
    />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { settings: contextSettings, updateSettings: updateContextSettings, loadSettings } = useSettings();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState<SettingsState>({
    theme: 'system',
    language: 'en',
    sidebarCollapsed: false,
    emailNotifications: true,
    systemNotifications: true,
    uploadNotifications: true,
    validationNotifications: true,
    responseStyle: 'normal',
    citationEnabled: true,
  });

  useEffect(() => {
    loadFromBackend();
  }, []);

  useEffect(() => {
    if (contextSettings.theme) {
      setForm((prev) => ({ ...prev, theme: contextSettings.theme }));
    }
    if (contextSettings.language) {
      setForm((prev) => ({ ...prev, language: contextSettings.language }));
    }
    if (contextSettings.sidebarCollapsed !== undefined) {
      setForm((prev) => ({ ...prev, sidebarCollapsed: contextSettings.sidebarCollapsed }));
    }
    if (contextSettings.emailNotifications !== undefined) {
      setForm((prev) => ({ ...prev, emailNotifications: contextSettings.emailNotifications }));
    }
    if (contextSettings.systemNotifications !== undefined) {
      setForm((prev) => ({ ...prev, systemNotifications: contextSettings.systemNotifications }));
    }
    if (contextSettings.uploadNotifications !== undefined) {
      setForm((prev) => ({ ...prev, uploadNotifications: contextSettings.uploadNotifications }));
    }
    if (contextSettings.validationNotifications !== undefined) {
      setForm((prev) => ({ ...prev, validationNotifications: contextSettings.validationNotifications }));
    }
    if (contextSettings.responseStyle) {
      setForm((prev) => ({ ...prev, responseStyle: contextSettings.responseStyle }));
    }
    if (contextSettings.citationEnabled !== undefined) {
      setForm((prev) => ({ ...prev, citationEnabled: contextSettings.citationEnabled }));
    }
  }, [contextSettings]);

  const loadFromBackend = async () => {
    setLoading(true);
    try {
      await loadSettings();
    } catch {
      addToast({ type: 'error', title: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: keyof SettingsState) => (value: SettingsState[keyof SettingsState]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    updateContextSettings(key as any, value as any);
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await api.request('/users/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          theme: form.theme,
          language: form.language,
          sidebarCollapsed: form.sidebarCollapsed,
          responseStyle: form.responseStyle,
          citationEnabled: form.citationEnabled,
          emailNotifications: form.emailNotifications,
          systemNotifications: form.systemNotifications,
          uploadNotifications: form.uploadNotifications,
          validationNotifications: form.validationNotifications,
        }),
      });
      addToast({ type: 'success', title: 'Settings saved successfully' });
    } catch (err) {
      addToast({ type: 'error', title: (err as Error).message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({ type: 'error', title: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      addToast({ type: 'error', title: 'Password must be at least 8 characters' });
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      addToast({ type: 'success', title: 'Password changed successfully' });
    } catch (err) {
      addToast({ type: 'error', title: (err as Error).message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Theme</label>
                <select
                  value={form.theme}
                  onChange={(e) => updateForm('theme')(e.target.value as Theme)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Language</label>
                <select
                  value={form.language}
                  onChange={(e) => updateForm('language')(e.target.value as Language)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="om">Oromiffa</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Collapsed Sidebar</p>
                  <p className="text-xs text-muted-foreground">Show sidebar as icons only</p>
                </div>
                <Switch checked={form.sidebarCollapsed} onChange={(val) => updateForm('sidebarCollapsed')(val)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={form.emailNotifications} onChange={(val) => updateForm('emailNotifications')(val)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch checked={form.systemNotifications} onChange={(val) => updateForm('systemNotifications')(val)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">AI Notifications</p>
                  <p className="text-xs text-muted-foreground">Notify when AI responds</p>
                </div>
                <Switch checked={form.uploadNotifications} onChange={(val) => updateForm('uploadNotifications')(val)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Validation Notifications</p>
                  <p className="text-xs text-muted-foreground">Notify on validation changes</p>
                </div>
                <Switch checked={form.validationNotifications} onChange={(val) => updateForm('validationNotifications')(val)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Brain size={18} className="text-primary" />
              <CardTitle>AI Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Response Detail Level</label>
                <select
                  value={form.responseStyle}
                  onChange={(e) => updateForm('responseStyle')(e.target.value as ResponseStyle)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                >
                  <option value="concise">Short</option>
                  <option value="normal">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preferred Citation Style</label>
                <select
                  value={form.citationEnabled ? 'enabled' : 'disabled'}
                  onChange={(e) => updateForm('citationEnabled')(e.target.value === 'enabled')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">AI Model</label>
                <Input value="Llama-3.3-70b" disabled />
                <p className="text-xs text-muted-foreground mt-1">Model selection coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Change your password to keep your account secure.</p>
                  <Button onClick={() => setShowPasswordForm(true)} variant="outline">
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
                    <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                    <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                    <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowPasswordForm(false)} disabled={changingPassword}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveGeneral} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
