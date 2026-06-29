'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Bell, Database, Mail, Save, Loader2 } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

interface Settings {
  systemNotifications?: boolean | string;
  emailAlerts?: boolean | string;
  autoBackup?: boolean | string;
  maintenanceMode?: boolean | string;
  smtpHost?: string;
  smtpPort?: string;
  [key: string]: unknown;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: Settings }>('/admin/settings');
      setSettings(response.data);
    } catch {
      setSettings({
        systemNotifications: 'true',
        emailAlerts: 'true',
        autoBackup: 'true',
        maintenanceMode: 'false',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      addToast({ type: 'success', title: 'Settings saved successfully' });
    } catch {
      addToast({ type: 'error', title: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings</p>
          <div className="text-center py-8">Loading settings...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">System Settings</h1>
          <p className="text-sm text-muted-foreground">Configure platform-wide settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell size={20} className="text-blue-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">System notifications</span>
                <input
                  type="checkbox"
                  checked={settings.systemNotifications === 'true' || settings.systemNotifications === true}
                  onChange={(e) => setSettings({ ...settings, systemNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Email alerts for admins</span>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts === 'true' || settings.emailAlerts === true}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Database size={20} className="text-blue-600" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Automatic backups</span>
                <input
                  type="checkbox"
                  checked={settings.autoBackup === 'true' || settings.autoBackup === true}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Maintenance mode</span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode === 'true' || settings.maintenanceMode === true}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail size={20} className="text-blue-600" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm">SMTP settings for notifications</p>
            <div className="space-y-2.5 sm:space-y-3">
              <input
                type="text"
                placeholder="SMTP Host"
                value={settings.smtpHost || ''}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
              />
              <input
                type="text"
                placeholder="SMTP Port"
                value={settings.smtpPort || ''}
                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}