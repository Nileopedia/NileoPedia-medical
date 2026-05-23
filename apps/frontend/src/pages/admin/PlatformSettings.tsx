import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Database, Bot } from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Platform Settings</h1>
        <p className="text-slate-500">Configure global platform settings, permissions, and AI parameters.</p>
      </div>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot size={20} className="text-blue-600" />
            </div>
            <div>
              <CardTitle>AI Model Configuration</CardTitle>
              <p className="text-sm text-slate-500">Manage default AI models and safety thresholds.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Default AI Model</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>GPT-4o + RAG</option>
              <option>Claude 3 Opus</option>
              <option>Llama 3 70B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimum Confidence Threshold (%)</label>
            <Input type="number" defaultValue="85" />
            <p className="text-xs text-slate-500 mt-1">Responses below this score will be automatically flagged for review.</p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-emerald-600" />
            </div>
            <div>
              <CardTitle>Security & Permissions</CardTitle>
              <p className="text-sm text-slate-500">Manage role-based access control (RBAC).</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Require 2-Validator Approval</p>
              <p className="text-xs text-slate-500">Responses must be approved by 2 validators before going live.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Allow Medical Users to View Pending Responses</p>
              <p className="text-xs text-slate-500">If enabled, users can see unvalidated AI outputs (not recommended).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Database & Maintenance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-amber-600" />
            </div>
            <div>
              <CardTitle>Database & Maintenance</CardTitle>
              <p className="text-sm text-slate-500">System maintenance and data management.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Clear Expired Sessions</p>
              <p className="text-xs text-slate-500">Remove inactive user sessions older than 30 days.</p>
            </div>
            <Button variant="outline" size="sm">Run Now</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Database Backup</p>
              <p className="text-xs text-slate-500">Last backup: May 29, 2025 at 10:15 AM</p>
            </div>
            <Button variant="outline" size="sm">Backup Now</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Save Platform Settings</Button>
      </div>
    </div>
  );
};
