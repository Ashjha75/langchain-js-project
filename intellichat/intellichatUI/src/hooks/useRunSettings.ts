/**
 * Custom hook for managing Run Settings state globally
 * This hook provides access to current settings and changed settings
 * for use in API requests throughout the application
 */

import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_RUN_SETTINGS, RunSettingsConfig } from '@/config/runSettingsDefaults';

interface UseRunSettingsReturn {
  // Current settings (all values)
  settings: RunSettingsConfig;
  
  // Only changed values (for API payload)
  changedSettings: Partial<RunSettingsConfig>;
  
  // Update a specific setting
  updateSetting: <K extends keyof RunSettingsConfig>(
    key: K,
    value: RunSettingsConfig[K]
  ) => void;
  
  // Reset all settings to default
  resetSettings: () => void;
  
  // Check if any settings have been modified
  hasChanges: boolean;
  
  // Get API payload (only non-default values)
  getApiPayload: () => Partial<RunSettingsConfig>;
  
  // ✅ NEW: Sync settings with conversation config
  syncWithConversationConfig: (config: Partial<RunSettingsConfig>) => void;
  
  // ✅ NEW: Batch update multiple settings at once
  updateMultipleSettings: (updates: Partial<RunSettingsConfig>) => void;
}

export const useRunSettings = (): UseRunSettingsReturn => {
  // Load settings from localStorage on mount
  const [settings, setSettings] = useState<RunSettingsConfig>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('runSettings');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored settings:', e);
        }
      }
    }
    return DEFAULT_RUN_SETTINGS;
  });

  const [changedSettings, setChangedSettings] = useState<Partial<RunSettingsConfig>>({});

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('runSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Update a specific setting and track changes
  const updateSetting = useCallback(<K extends keyof RunSettingsConfig>(
    key: K,
    value: RunSettingsConfig[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Track if value differs from default
    if (JSON.stringify(value) !== JSON.stringify(DEFAULT_RUN_SETTINGS[key])) {
      setChangedSettings((prev) => ({ ...prev, [key]: value }));
    } else {
      // Remove from changed settings if it matches default
      setChangedSettings((prev) => {
        const newChanged = { ...prev };
        delete newChanged[key];
        return newChanged;
      });
    }
  }, []);

  // Reset all settings to default
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_RUN_SETTINGS);
    setChangedSettings({});
    if (typeof window !== 'undefined') {
      localStorage.setItem('runSettings', JSON.stringify(DEFAULT_RUN_SETTINGS));
    }
  }, []);

  // Get API payload with only non-default values
  const getApiPayload = useCallback(() => {
    return changedSettings;
  }, [changedSettings]);

  // ✅ NEW: Batch update multiple settings at once
  const updateMultipleSettings = useCallback((updates: Partial<RunSettingsConfig>) => {
    setSettings((prev) => {
      const newSettings = { ...prev } as RunSettingsConfig;
      
      // Apply all updates with proper type handling
      (Object.keys(updates) as Array<keyof RunSettingsConfig>).forEach((key) => {
        const value = updates[key];
        if (value !== undefined) {
          // Handle nested objects properly
          if (key === 'builtInTools' && typeof value === 'object') {
            newSettings.builtInTools = {
              ...prev.builtInTools,
              ...(value as Partial<typeof prev.builtInTools>),
            };
          } else if (key === 'advanced' && typeof value === 'object') {
            newSettings.advanced = {
              ...prev.advanced,
              ...(value as Partial<typeof prev.advanced>),
            };
          } else {
            (newSettings as any)[key] = value;
          }
        }
      });
      
      return newSettings;
    });

    // Update changed settings tracking
    setChangedSettings((prev) => {
      const newChanged = { ...prev } as Partial<RunSettingsConfig>;
      
      (Object.keys(updates) as Array<keyof RunSettingsConfig>).forEach((key) => {
        const value = updates[key];
        if (value !== undefined) {
          const defaultValue = DEFAULT_RUN_SETTINGS[key];
          
          // Check if value differs from default
          if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
            (newChanged as any)[key] = value;
          } else {
            delete (newChanged as any)[key];
          }
        }
      });
      
      return newChanged;
    });
  }, []);

  // ✅ NEW: Sync settings with conversation config (loads conversation's saved settings into UI)
  const syncWithConversationConfig = useCallback((config: Partial<RunSettingsConfig>) => {
    console.log('🔄 [RunSettings] Syncing with conversation config:', config);
    
    // Update settings with conversation config
    updateMultipleSettings(config);
    
    console.log('✅ [RunSettings] Synced successfully');
  }, [updateMultipleSettings]);

  const hasChanges = Object.keys(changedSettings).length > 0;

  return {
    settings,
    changedSettings,
    updateSetting,
    resetSettings,
    hasChanges,
    getApiPayload,
    syncWithConversationConfig,
    updateMultipleSettings,
  };
};
