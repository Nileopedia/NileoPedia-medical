'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { api } from '../lib/api';
import { useTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'am' | 'om';
type ResponseStyle = 'concise' | 'normal' | 'detailed';

interface Settings {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  responseStyle: ResponseStyle;
  citationEnabled: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  uploadNotifications: boolean;
  validationNotifications: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (key: keyof Settings, value: Settings[keyof Settings]) => void;
  loadSettings: () => Promise<void>;
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

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  updateSettings: () => {},
  loadSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { setTheme: setNextTheme, theme: nextTheme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.theme !== nextTheme) {
      setNextTheme(settings.theme);
    }
  }, [settings.theme, nextTheme]);

  const loadSettings = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('settings');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
        if (parsed.sidebarCollapsed) {
          useAppStore.getState().toggleSidebar();
        }
      } catch {
        // Ignore parse errors, use defaults
      }
    }

    if (!token) return;

    try {
      const backendPrefs = await api.request<{ success: boolean; data: Partial<Settings> }>('/users/preferences');
      if (backendPrefs.data) {
        setSettings((prev) => {
          const merged = { ...prev, ...backendPrefs.data };
          localStorage.setItem('settings', JSON.stringify(merged));
          return merged;
        });
      }
    } catch {
      // Backend not available or error, using localStorage values
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('settings', JSON.stringify(settings));
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      api.request('/users/preferences', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }).catch(() => {
        // Silently fail for background sync
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [settings]);

  const updateSettings = useCallback((key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);