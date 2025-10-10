'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigSidebar } from '@/components/ConfigSidebar';

export default function ConfigDemoPage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Main content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                IntelliChat Pro Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your AI model settings, security preferences, and logging configuration
              </p>
            </div>
            <Button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Open Settings
            </Button>
          </div>

          {/* Demo content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                AI Model Settings
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Model Selection</li>
                <li>• Temperature Control</li>
                <li>• Max Tokens</li>
                <li>• Top P Parameter</li>
                <li>• Timeout Settings</li>
                <li>• Tool Configuration</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Security Settings
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Password Requirements</li>
                <li>• Character Validation</li>
                <li>• Rate Limiting</li>
                <li>• Request Throttling</li>
                <li>• Security Policies</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Logging Configuration
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Log Levels</li>
                <li>• File Logging</li>
                <li>• Console Output</li>
                <li>• Rotation Settings</li>
                <li>• Archive Management</li>
              </ul>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Configuration Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Real-time Updates
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All configuration changes are reflected immediately in the UI with live preview.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Default Values
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Pre-configured with optimal defaults from your backend environment settings.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Validation
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Input validation ensures all settings are within acceptable ranges.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Collapsible Sections
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Organized configuration with expandable sections for better usability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Sidebar */}
      <ConfigSidebar
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}