'use client';

import React, { useState } from 'react';
import { Bell, Shield, Save } from 'lucide-react';
import { AppLayout } from '../../../components/layout/AppLayout';

export default function ValidatorSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reviewAssignments: true,
    autoAssign: false,
  });

  const handleSave = () => {
    console.log('Validator settings saved:', settings);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your validator preferences</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Bell size={20} className="text-blue-600" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-foreground">Email notifications</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-foreground">Review assignments</span>
              <input
                type="checkbox"
                checked={settings.reviewAssignments}
                onChange={(e) => setSettings({ ...settings, reviewAssignments: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Shield size={20} className="text-blue-600" />
            Review Preferences
          </h2>
          <label className="flex items-center justify-between">
            <span className="text-foreground">Auto-assign reviews</span>
            <input
              type="checkbox"
              checked={settings.autoAssign}
              onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </AppLayout>
  );
}