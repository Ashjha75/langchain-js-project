'use client';

import { FC, useState, ChangeEvent } from 'react';
import { Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ConfigSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  timeout: number;
  enableTools: boolean;
}

interface SecurityConfig {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
}

interface LoggingConfig {
  logLevel: string;
  fileEnabled: boolean;
  consoleEnabled: boolean;
  maxFiles: number;
}

export const ConfigSidebar: FC<ConfigSidebarProps> = ({ isOpen, onClose }) => {
  // Default values from backend .env
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    model: 'openai/gpt-oss-120b',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    timeout: 30000,
    enableTools: true,
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    passwordMinLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    rateLimitWindow: 900000,
    rateLimitMaxRequests: 100,
  });

  const [loggingConfig, setLoggingConfig] = useState<LoggingConfig>({
    logLevel: 'info',
    fileEnabled: true,
    consoleEnabled: true,
    maxFiles: 5,
  });

  const [expandedSections, setExpandedSections] = useState({
    ai: true,
    security: false,
    logging: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aiConfig, securityConfig, loggingConfig }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Configuration saved successfully');
        // TODO: Add toast notification here
        // toast.success('Configuration saved successfully');
      } else {
        console.error('Failed to save configuration:', result.message);
        // TODO: Add error toast
        // toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      // TODO: Add error toast
      // toast.error('Error saving configuration');
    }
  };

  const resetToDefaults = () => {
    setAiConfig({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
      timeout: 30000,
      enableTools: true,
    });
    setSecurityConfig({
      passwordMinLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      rateLimitWindow: 900000,
      rateLimitMaxRequests: 100,
    });
    setLoggingConfig({
      logLevel: 'info',
      fileEnabled: true,
      consoleEnabled: true,
      maxFiles: 5,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Configuration</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* AI Configuration */}
        <Card>
          <Collapsible open={expandedSections.ai} onOpenChange={() => toggleSection('ai')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  AI Model Settings
                  {expandedSections.ai ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={aiConfig.model} onValueChange={(value: string) => setAiConfig(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai/gpt-oss-120b">GPT OSS 120B</SelectItem>
                      <SelectItem value="llama-3.1-70b-versatile">Llama 3.1 70B</SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                      <SelectItem value="gemma-7b-it">Gemma 7B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature: {aiConfig.temperature}</Label>
                  <Slider
                    value={[aiConfig.temperature]}
                    onValueChange={(values: number[]) => setAiConfig(prev => ({ ...prev, temperature: values[0] || 0.7 }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 0 }))}
                    min={1}
                    max={8192}
                  />
                </div>

                <div>
                  <Label htmlFor="topP">Top P: {aiConfig.topP}</Label>
                  <Slider
                    value={[aiConfig.topP]}
                    onValueChange={(values: number[]) => setAiConfig(prev => ({ ...prev, topP: values[0] || 0.9 }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={aiConfig.timeout}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAiConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 0 }))}
                    min={1000}
                    max={120000}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTools"
                    checked={aiConfig.enableTools}
                    onCheckedChange={(checked: boolean) => setAiConfig(prev => ({ ...prev, enableTools: checked }))}
                  />
                  <Label htmlFor="enableTools">Enable Tools</Label>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Security Configuration */}
        <Card>
          <Collapsible open={expandedSections.security} onOpenChange={() => toggleSection('security')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  Security Settings
                  {expandedSections.security ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securityConfig.passwordMinLength}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSecurityConfig(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 0 }))}
                    min={6}
                    max={50}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireUppercase"
                      checked={securityConfig.requireUppercase}
                      onCheckedChange={(checked: boolean) => setSecurityConfig(prev => ({ ...prev, requireUppercase: checked }))}
                    />
                    <Label htmlFor="requireUppercase">Require Uppercase</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireLowercase"
                      checked={securityConfig.requireLowercase}
                      onCheckedChange={(checked: boolean) => setSecurityConfig(prev => ({ ...prev, requireLowercase: checked }))}
                    />
                    <Label htmlFor="requireLowercase">Require Lowercase</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={securityConfig.requireNumbers}
                      onCheckedChange={(checked: boolean) => setSecurityConfig(prev => ({ ...prev, requireNumbers: checked }))}
                    />
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={securityConfig.requireSpecialChars}
                      onCheckedChange={(checked: boolean) => setSecurityConfig(prev => ({ ...prev, requireSpecialChars: checked }))}
                    />
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rateLimitWindow">Rate Limit Window (ms)</Label>
                  <Input
                    id="rateLimitWindow"
                    type="number"
                    value={securityConfig.rateLimitWindow}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSecurityConfig(prev => ({ ...prev, rateLimitWindow: parseInt(e.target.value) || 0 }))}
                    min={60000}
                    max={3600000}
                  />
                </div>

                <div>
                  <Label htmlFor="rateLimitMaxRequests">Max Requests per Window</Label>
                  <Input
                    id="rateLimitMaxRequests"
                    type="number"
                    value={securityConfig.rateLimitMaxRequests}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSecurityConfig(prev => ({ ...prev, rateLimitMaxRequests: parseInt(e.target.value) || 0 }))}
                    min={10}
                    max={1000}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Logging Configuration */}
        <Card>
          <Collapsible open={expandedSections.logging} onOpenChange={() => toggleSection('logging')}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  Logging Settings
                  {expandedSections.logging ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select value={loggingConfig.logLevel} onValueChange={(value: string) => setLoggingConfig(prev => ({ ...prev, logLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="verbose">Verbose</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="silly">Silly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="fileEnabled"
                    checked={loggingConfig.fileEnabled}
                    onCheckedChange={(checked: boolean) => setLoggingConfig(prev => ({ ...prev, fileEnabled: checked }))}
                  />
                  <Label htmlFor="fileEnabled">Enable File Logging</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="consoleEnabled"
                    checked={loggingConfig.consoleEnabled}
                    onCheckedChange={(checked: boolean) => setLoggingConfig(prev => ({ ...prev, consoleEnabled: checked }))}
                  />
                  <Label htmlFor="consoleEnabled">Enable Console Logging</Label>
                </div>

                <div>
                  <Label htmlFor="maxFiles">Max Log Files</Label>
                  <Input
                    id="maxFiles"
                    type="number"
                    value={loggingConfig.maxFiles}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLoggingConfig(prev => ({ ...prev, maxFiles: parseInt(e.target.value) || 0 }))}
                    min={1}
                    max={50}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={saveConfig} className="w-full">
            Save Configuration
          </Button>
          <Button onClick={resetToDefaults} variant="outline" className="w-full">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigSidebar;