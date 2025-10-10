'use client';

import { FC, useState } from 'react';
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
import { Code, Settings, X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RunSettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunSettingsSidebar: FC<RunSettingsSidebarProps> = ({ isOpen, onClose }) => {
  const [temperature, setTemperature] = useState(0.95);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [topP, setTopP] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-sidebar-background border-l border-sidebar-border p-4 flex flex-col space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          PARAMETERS
        </h2>
        <div className="flex items-center space-x-2">
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
        <Select defaultValue="gemini-2.5-pro">
          <SelectTrigger className="mt-2 rounded-lg">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
            <SelectItem value="gemini-flash-latest">Gemini Flash Latest</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Our most powerful reasoning model, which excels at coding and complex reasoning tasks.
        </p>
      </div>

      {/* System Instructions */}
      <div className="p-4 bg-accent rounded-lg">
        <Label htmlFor="system-instructions" className="text-sm font-medium">System instructions</Label>
        <Textarea
          id="system-instructions"
          placeholder="Optional tone and style instructions for the model"
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
            value={temperature.toFixed(2)}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-20 rounded-lg"
          />
        </div>
        <Slider
          id="temperature"
          value={[temperature]}
          onValueChange={(values) => setTemperature(values[0] ?? 0.95)}
          max={2}
          min={0}
          step={0.01}
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
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-20 rounded-lg"
          />
        </div>
        <Slider
          id="max-tokens"
          value={[maxTokens]}
          onValueChange={(values) => setMaxTokens(values[0] ?? 8192)}
          max={8192}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      {/* Reasoning */}
      <div>
        <Label>Reasoning</Label>
        <Select defaultValue="medium">
          <SelectTrigger className="mt-2 rounded-lg">
            <SelectValue placeholder="Select a reasoning level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
            <SelectItem value="low">low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stream and JSON Mode */}
      <div className="flex items-center justify-between">
        <Label htmlFor="stream">Stream</Label>
        <Switch id="stream" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="json-mode">JSON Mode</Label>
        <Switch id="json-mode" />
      </div>

      {/* Built-in tools */}
      <div>
        <h3 className="text-base font-semibold">Built-in tools</h3>
        <div className="space-y-4 mt-2 p-4 bg-accent rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="browser-search">Browser Search</Label>
              <Switch id="browser-search" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="code-interpreter">Code Interpreter</Label>
              <Switch id="code-interpreter" />
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
              <Switch id="moderation" />
            </div>
            {/* Top P */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="top-p">Top P</Label>
                <Input
                  id="top-p-value"
                  type="number"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-20 rounded-lg"
                />
              </div>
              <Slider
                id="top-p"
                value={[topP]}
                onValueChange={(values) => setTopP(values[0] ?? 1)}
                max={1}
                min={0}
                step={0.01}
                className="mt-2"
              />
            </div>
            {/* Seed */}
            <div>
              <Label htmlFor="seed">Seed</Label>
              <Input id="seed" type="number" className="mt-2 rounded-lg" />
            </div>
            {/* Stop Sequence */}
            <div>
              <Label htmlFor="stop-sequence">Stop Sequence</Label>
              <Input id="stop-sequence" className="mt-2 rounded-lg" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Template</Label>
              <Switch id="template" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RunSettingsSidebar;
