'use client';

import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Code, Settings, X, ChevronDown, ChevronUp, Plus, RotateCcw } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DEFAULT_RUN_SETTINGS, 
  RunSettingsConfig, 
  MODEL_OPTIONS, 
  REASONING_OPTIONS,
  PARAMETER_CONSTRAINTS 
} from '@/config/runSettingsDefaults';

interface RunSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: RunSettingsConfig) => void;
}

export const RunSettingsSidebar: FC<RunSettingsSidebarProps> = ({ 
  isOpen, 
  onClose,
  onSettingsChange 
}) => {
  // Initialize with default settings
  const [settings, setSettings] = useState<RunSettingsConfig>(DEFAULT_RUN_SETTINGS);
  
  // Track changes (only modified values)
  const [changedSettings, setChangedSettings] = useState<Partial<RunSettingsConfig>>({});

  // Update parent component whenever settings change
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  // Helper function to update settings and track changes
  const updateSetting = <K extends keyof RunSettingsConfig>(
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
  };

  // Reset to default values
  const handleReset = () => {
    setSettings(DEFAULT_RUN_SETTINGS);
    setChangedSettings({});
  };

  // Check if any settings have been modified
  const hasChanges = Object.keys(changedSettings).length > 0;

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-sidebar-background border-l border-sidebar-border p-4 flex flex-col space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          PARAMETERS
        </h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleReset}
            disabled={!hasChanges}
            title="Reset to defaults"
          >
            <RotateCcw className={`h-5 w-5 ${hasChanges ? 'text-blue-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Code className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-4 bg-accent rounded-lg">
        <Label className="text-sm font-medium">Model selection</Label>
        <Select 
          value={settings.model} 
          onValueChange={(value) => updateSetting('model', value)}
        >
          <SelectTrigger className="mt-2 rounded-lg">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          {MODEL_OPTIONS.find((m) => m.value === settings.model)?.description}
        </p>
      </div>

      {/* System Instructions */}
      <div className="p-4 bg-accent rounded-lg">
        <Label htmlFor="system-instructions" className="text-sm font-medium">System instructions</Label>
        <Textarea
          id="system-instructions"
          placeholder="Optional tone and style instructions for the model"
          value={settings.systemInstructions}
          onChange={(e) => updateSetting('systemInstructions', e.target.value)}
          className="min-h-[100px] mt-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
        />
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature-value"
            type="number"
            value={settings.temperature.toFixed(2)}
            onChange={(e) => updateSetting('temperature', parseFloat(e.target.value) || 0)}
            className="w-20 rounded-lg"
          />
        </div>
        <Slider
          id="temperature"
          value={[settings.temperature]}
          onValueChange={(values) => updateSetting('temperature', values[0] ?? DEFAULT_RUN_SETTINGS.temperature)}
          max={PARAMETER_CONSTRAINTS.temperature.max}
          min={PARAMETER_CONSTRAINTS.temperature.min}
          step={PARAMETER_CONSTRAINTS.temperature.step}
          className="mt-2"
        />
      </div>

      {/* Max Completion Tokens */}
      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="max-tokens">Max Completion Tokens</Label>
          <Input
            id="max-tokens-value"
            type="number"
            value={settings.maxCompletionTokens}
            onChange={(e) => updateSetting('maxCompletionTokens', parseInt(e.target.value) || 1)}
            className="w-20 rounded-lg"
          />
        </div>
        <Slider
          id="max-tokens"
          value={[settings.maxCompletionTokens]}
          onValueChange={(values) => updateSetting('maxCompletionTokens', values[0] ?? DEFAULT_RUN_SETTINGS.maxCompletionTokens)}
          max={PARAMETER_CONSTRAINTS.maxCompletionTokens.max}
          min={PARAMETER_CONSTRAINTS.maxCompletionTokens.min}
          step={PARAMETER_CONSTRAINTS.maxCompletionTokens.step}
          className="mt-2"
        />
      </div>

      {/* Reasoning */}
      <div>
        <Label>Reasoning</Label>
        <Select 
          value={settings.reasoning} 
          onValueChange={(value: 'low' | 'medium' | 'high') => updateSetting('reasoning', value)}
        >
          <SelectTrigger className="mt-2 rounded-lg">
            <SelectValue placeholder="Select a reasoning level" />
          </SelectTrigger>
          <SelectContent>
            {REASONING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stream and JSON Mode */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stream">Stream</Label>
        <Switch 
          id="stream" 
          checked={settings.stream}
          onCheckedChange={(checked) => updateSetting('stream', checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="json-mode">JSON Mode</Label>
        <Switch 
          id="json-mode" 
          checked={settings.jsonMode}
          onCheckedChange={(checked) => updateSetting('jsonMode', checked)}
        />
      </div>

      {/* Built-in tools */}
      <div>
        <h3 className="text-base font-semibold">Built-in tools</h3>
        <div className="space-y-4 mt-2 p-4 bg-accent rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-search">Browser Search</Label>
              <Switch 
                id="browser-search" 
                checked={settings.builtInTools.browserSearch}
                onCheckedChange={(checked) => 
                  updateSetting('builtInTools', { ...settings.builtInTools, browserSearch: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="code-interpreter">Code Interpreter</Label>
              <Switch 
                id="code-interpreter" 
                checked={settings.builtInTools.codeInterpreter}
                onCheckedChange={(checked) => 
                  updateSetting('builtInTools', { ...settings.builtInTools, codeInterpreter: checked })
                }
              />
            </div>
        </div>
      </div>

      {/* MCP Servers */}
      <div>
        <h3 className="text-base font-semibold">MCP Servers</h3>
        <Button variant="outline" className="w-full mt-2 rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Advanced */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <h3 className="text-base font-semibold">Advanced</h3>
            <ChevronDown className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 mt-2 p-4 bg-accent rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="moderation">Moderation: llamaguard</Label>
              <Switch 
                id="moderation" 
                checked={settings.advanced.moderation}
                onCheckedChange={(checked) => 
                  updateSetting('advanced', { ...settings.advanced, moderation: checked })
                }
              />
            </div>
            {/* Top P */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="top-p">Top P</Label>
                <Input
                  id="top-p-value"
                  type="number"
                  value={settings.advanced.topP}
                  onChange={(e) => 
                    updateSetting('advanced', { ...settings.advanced, topP: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 rounded-lg"
                />
              </div>
              <Slider
                id="top-p"
                value={[settings.advanced.topP]}
                onValueChange={(values) => 
                  updateSetting('advanced', { ...settings.advanced, topP: values[0] ?? DEFAULT_RUN_SETTINGS.advanced.topP })
                }
                max={PARAMETER_CONSTRAINTS.topP.max}
                min={PARAMETER_CONSTRAINTS.topP.min}
                step={PARAMETER_CONSTRAINTS.topP.step}
                className="mt-2"
              />
            </div>
            {/* Seed */}
            <div>
              <Label htmlFor="seed">Seed</Label>
              <Input 
                id="seed" 
                type="number" 
                value={settings.advanced.seed ?? ''}
                onChange={(e) => 
                  updateSetting('advanced', { 
                    ...settings.advanced, 
                    seed: e.target.value ? parseInt(e.target.value) : null 
                  })
                }
                className="mt-2 rounded-lg" 
              />
            </div>
            {/* Stop Sequence */}
            <div>
              <Label htmlFor="stop-sequence">Stop Sequence</Label>
              <Input 
                id="stop-sequence" 
                value={settings.advanced.stopSequence}
                onChange={(e) => 
                  updateSetting('advanced', { ...settings.advanced, stopSequence: e.target.value })
                }
                className="mt-2 rounded-lg" 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Template</Label>
              <Switch 
                id="template" 
                checked={settings.advanced.template}
                onCheckedChange={(checked) => 
                  updateSetting('advanced', { ...settings.advanced, template: checked })
                }
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RunSettingsSidebar;
