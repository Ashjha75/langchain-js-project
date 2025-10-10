/**
 * TEST COMPONENT - Place this temporarily in your page to verify state is working
 * You can remove this after testing
 */

'use client';

import { useState } from 'react';
import { RunSettingsSidebar } from '@/components/RunSettingsSidebar';
import { RunSettingsConfig } from '@/config/runSettingsDefaults';

export function TestRunSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<RunSettingsConfig | null>(null);

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 bg-gray-900">
        <h1 className="text-2xl font-bold text-white mb-4">Run Settings Test</h1>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          {isOpen ? 'Close' : 'Open'} Settings
        </button>

        {currentSettings && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Current Settings:</h2>
            <pre className="text-green-400 text-sm overflow-auto max-h-96">
              {JSON.stringify(currentSettings, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <RunSettingsSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSettingsChange={(settings) => {
          setCurrentSettings(settings);
          console.log('Settings changed:', settings);
        }}
      />
    </div>
  );
}
