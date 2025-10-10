/**
 * Run Settings Context Provider
 * Provides run settings state globally to all components
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { RunSettingsConfig } from '@/config/runSettingsDefaults';
import { useRunSettings } from '@/hooks/useRunSettings';

interface RunSettingsContextType {
  settings: RunSettingsConfig;
  changedSettings: Partial<RunSettingsConfig>;
  updateSetting: <K extends keyof RunSettingsConfig>(
    key: K,
    value: RunSettingsConfig[K]
  ) => void;
  resetSettings: () => void;
  hasChanges: boolean;
  getApiPayload: () => Partial<RunSettingsConfig>;
}

const RunSettingsContext = createContext<RunSettingsContextType | undefined>(undefined);

export const RunSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const runSettings = useRunSettings();

  return (
    <RunSettingsContext.Provider value={runSettings}>
      {children}
    </RunSettingsContext.Provider>
  );
};

export const useRunSettingsContext = () => {
  const context = useContext(RunSettingsContext);
  if (context === undefined) {
    throw new Error('useRunSettingsContext must be used within a RunSettingsProvider');
  }
  return context;
};
