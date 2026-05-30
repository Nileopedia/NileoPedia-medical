'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Bell, Shield, Save } from 'lucide-react';

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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Customize your validator preferences</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Email notifications</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Review assignments</span>
              <input
                type="checkbox"
                checked={settings.reviewAssignments}
                onChange={(e) => setSettings({ ...settings, reviewAssignments: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Review Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">Auto-assign reviews</span>
            <input
              type="checkbox"
              checked={settings.autoAssign}
              onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save size={16} />
          Save Settings
        </Button>
      </div>
    </div>
  );
}