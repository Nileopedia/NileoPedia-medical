'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Bell, Shield, Save, Loader2 } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import { useTheme } from 'next-themes';

export default function ValidatorSettingsPage() {
  const [settings, setSettings] = useState({
    reviewAlerts: true,
    feedbackAlerts: true,
    emailNotifications: true,
    autoSortByPriority: false,
    citationDisplay: 'inline',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.request<{ success: boolean; data: typeof settings }>('/validator/settings');
      setSettings(response.data);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.request('/validator/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      addToast({ type: 'success', title: 'Settings saved successfully' });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Settings</h1>
          <div className="text-center py-6 sm:py-8 text-sm">Loading settings...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your validator preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell size={18} className="text-blue-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Review alerts</span>
                <input
                  type="checkbox"
                  checked={settings.reviewAlerts}
                  onChange={(e) => setSettings({ ...settings, reviewAlerts: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Feedback alerts</span>
                <input
                  type="checkbox"
                  checked={settings.feedbackAlerts}
                  onChange={(e) => setSettings({ ...settings, feedbackAlerts: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield size={18} className="text-blue-600" />
              Review Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-foreground text-sm">Auto-sort by priority</span>
                <input
                  type="checkbox"
                  checked={settings.autoSortByPriority}
                  onChange={(e) => setSettings({ ...settings, autoSortByPriority: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-blue-600 focus:ring-blue-500 bg-input"
                />
              </label>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">Citation display</label>
                <select
                  value={settings.citationDisplay}
                  onChange={(e) => setSettings({ ...settings, citationDisplay: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                >
                  <option value="inline">Inline</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </div>
    </AppLayout>
  );
}