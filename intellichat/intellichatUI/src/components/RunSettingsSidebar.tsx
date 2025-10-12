'use client';

import { FC, useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
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
import { ModelSelector } from '@/components/ModelSelector';
import { Textarea } from '@/components/ui/textarea';
import { Code, X, ChevronDown, ChevronUp, Plus, RotateCcw, Check, Pencil, Save } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DEFAULT_RUN_SETTINGS, 
  RunSettingsConfig, 
  REASONING_OPTIONS,
  PARAMETER_CONSTRAINTS 
} from '@/config/runSettingsDefaults';
import tooltipMessages from '@/config/tooltipMessages.json';

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
  const { currentChatConfig: settings, actions } = useAppStore();
  const { setCurrentChatConfig } = actions;
  
  // Track changes (only modified values)
  const [changedSettings, setChangedSettings] = useState<Partial<RunSettingsConfig>>({});
  
  // Copy feedback state
  const [copied, setCopied] = useState(false);

  // System instructions edit state
  const [isEditingInstructions, setIsEditingInstructions] = useState(
    !settings.systemInstructions
  );
  const [tempInstructions, setTempInstructions] = useState(
    settings.systemInstructions
  );

  useEffect(() => {
    setTempInstructions(settings.systemInstructions);
    setIsEditingInstructions(!settings.systemInstructions);
  }, [settings.systemInstructions]);

  const handleSaveInstructions = () => {
    updateSetting('systemInstructions', tempInstructions);
    setIsEditingInstructions(false);
  };

  const handleEditInstructions = () => {
    setIsEditingInstructions(true);
  };

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
    setCurrentChatConfig({ [key]: value });
    
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
    setCurrentChatConfig(DEFAULT_RUN_SETTINGS);
    setChangedSettings({});
    console.log('✅ Settings reset to defaults');
  };

  // Copy JSON to clipboard (full settings with all values)
  const handleCopyJSON = async () => {
    try {
      const jsonString = JSON.stringify(settings, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      console.log('📋 Full settings JSON copied to clipboard:', jsonString);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  // Check if any settings have been modified
  const hasChanges = Object.keys(changedSettings).length > 0;

  // Log state changes for debugging
  useEffect(() => {
    // console.log('📊 Current Settings:', settings);
    // console.log('🔄 Changed Settings (for API):', changedSettings);
    // console.log('✨ Has Changes:', hasChanges);
  }, [settings, changedSettings, hasChanges]);

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-sidebar-background border-l border-sidebar-border p-4 flex flex-col space-y-6 overflow-y-auto overflow-x-visible">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          PARAMETERS
        </h2>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleReset}
                disabled={!hasChanges}
                className={hasChanges ? 'hover:bg-blue-500/10' : ''}
              >
                <RotateCcw className={`h-5 w-5 transition-colors ${hasChanges ? 'text-blue-500' : 'text-gray-500'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{hasChanges ? "Reset to defaults" : "No changes to reset"}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopyJSON}
                className="relative"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Code className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{copied ? "Copied!" : "Copy settings JSON"}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-4 bg-accent rounded-lg overflow-visible">
        <Label className="text-sm font-medium">Model selection</Label>
        <div className="overflow-visible">
          <ModelSelector
            value={settings.model}
            onChange={(value) => updateSetting('model', value)}
          />
        </div>
      </div>

      {/* System Instructions */}
      <div className="p-4 bg-accent rounded-lg">
        <div className="flex justify-between items-center">
          <Label htmlFor="system-instructions" className="text-sm font-medium">System instructions</Label>
          <div className="flex items-center space-x-2">
            {isEditingInstructions ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveInstructions}
                    disabled={!tempInstructions}
                  >
                    <Save className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Save</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditInstructions}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <Textarea
          id="system-instructions"
          placeholder="Optional tone and style instructions for the model"
          value={tempInstructions}
          onChange={(e) => setTempInstructions(e.target.value)}
          className="min-h-[100px] mt-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
          disabled={!isEditingInstructions}
        />
      </div>

      {/* Temperature */}
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipMessages.temperature}</p>
          </TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipMessages.maxCompletionTokens}</p>
          </TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Label>Reasoning</Label>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipMessages.reasoning}</p>
          </TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="stream">Stream</Label>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipMessages.stream}</p>
          </TooltipContent>
        </Tooltip>
        <Switch 
          id="stream" 
          checked={settings.stream}
          onCheckedChange={(checked) => {
            updateSetting('stream', checked);
            if (checked) {
              updateSetting('jsonMode', false);
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="json-mode">JSON Mode</Label>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipMessages.jsonMode}</p>
          </TooltipContent>
        </Tooltip>
        <Switch 
          id="json-mode" 
          checked={settings.jsonMode}
          onCheckedChange={(checked) => {
            updateSetting('jsonMode', checked);
            if (checked) {
              updateSetting('stream', false);
            }
          }}
        />
      </div>

      {/* Built-in tools */}
      <div>
        <h3 className="text-base font-semibold">Built-in tools</h3>
        <div className="space-y-4 mt-2 p-4 bg-accent rounded-lg">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="browser-search">Browser Search</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.tools.browserSearch}</p>
                </TooltipContent>
              </Tooltip>
              <Switch 
                id="browser-search" 
                checked={settings.builtInTools.browserSearch}
                onCheckedChange={(checked) => 
                  updateSetting('builtInTools', { ...settings.builtInTools, browserSearch: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="code-interpreter">Code Interpreter</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.tools.codeExecution}</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="moderation">Moderation: llamaguard</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.moderation}</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.topP}</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="seed">Seed</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.seed}</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="stop-sequence">Stop Sequence</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.stopSequence}</p>
                </TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="template">Template</Label>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tooltipMessages.template}</p>
                </TooltipContent>
              </Tooltip>
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
