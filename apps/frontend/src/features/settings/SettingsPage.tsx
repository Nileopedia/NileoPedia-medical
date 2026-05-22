import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, UserCheck, Bell, Shield, Database, Save, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_USER_ROLES, MOCK_LANGUAGES } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode, language, setLanguage, currentUser, setCurrentUser, t, showToast } = useAppStore();

  const [apiUrl, setApiUrl] = useState('https://api.nileopedia.internal/v1');
  const [pineconeEnv, setPineconeEnv] = useState('us-east-1-aws');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    showToast('System configuration & preferences saved successfully!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {t('settings.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize platform appearance, clinical credentials, and microservice gateway connections.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Clinical Session Settings */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              <UserCheck className="text-blue-600 dark:text-blue-500" size={18} />
              Active Clinical User Credentials
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Simulated User Role & Clearance
              </label>
              <select
                value={currentUser.id}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-4 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {MOCK_USER_ROLES.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} — {role.title} ({role.department})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Switching roles instantly updates your validation clearance and audit log signature.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Interface Language (i18n Simulation)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-4 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {MOCK_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Supports English, Amharic (Ethiopia), and Arabic with localized medical terminology.
              </p>
            </div>
          </Card>

          {/* Theme & Accessibility Preferences */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Shield className="text-purple-600 dark:text-purple-500" size={18} />
              Appearance & Accessibility
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} className="text-purple-500" /> : <Sun size={20} className="text-amber-500" />}
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Dark Mode Theme</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Optimized for low-light clinical environments</span>
                </div>
              </div>
              <Button
                type="button"
                variant={darkMode ? 'primary' : 'outline'}
                size="sm"
                onClick={toggleDarkMode}
              >
                {darkMode ? 'Dark Active' : 'Light Active'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-blue-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Validation Alerts</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive email alerts for urgent queue items</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">High Contrast Mode</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Enhance medical table readability</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>
          </Card>

          {/* Microservice Gateway Endpoints */}
          <Card className="p-6 space-y-5 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Database className="text-emerald-600 dark:text-emerald-500" size={18} />
              Microservice Gateway & Vector Store Endpoints
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Express Backend API Base URL
                </label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.nileopedia.internal/v1"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Target for query submission, audit logs, and PostgreSQL synchronization.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pinecone Vector Environment
                </label>
                <Input
                  value={pineconeEnv}
                  onChange={(e) => setPineconeEnv(e.target.value)}
                  placeholder="us-east-1-aws"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Target cloud region for dense vector similarity search and reranking.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 size={16} /> Settings saved successfully!
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<Save size={18} />}
            className="font-bold shadow-lg shadow-blue-500/20"
          >
            Save All Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
