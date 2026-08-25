'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../components/ThemeProvider';

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
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();

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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE_URL}/users/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const body = await res.json();
      const backendPrefs = body?.data;
      if (backendPrefs) {
        const { id, userId, createdAt, updatedAt, ...prefsOnly } = backendPrefs;
        setSettings((prev) => {
          const merged = { ...prev, ...prefsOnly } as Settings;
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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${API_BASE_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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