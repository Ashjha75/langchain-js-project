/**
 * Default configuration for Run Settings / Parameters
 * This JSON structure defines all parameters with their default values
 */

export interface RunSettingsConfig {
  // Model Configuration
  model: string;
  systemInstructions: string;

  // Core Parameters
  temperature: number;
  maxCompletionTokens: number;
  reasoning: 'low' | 'medium' | 'high';
  
  // Modes
  stream: boolean;
  jsonMode: boolean;

  // Built-in Tools
  builtInTools: {
    browserSearch: boolean;
    codeInterpreter: boolean;
  };

  // MCP Servers
  mcpServers: string[];

  // Advanced Settings
  advanced: {
    moderation: boolean;
    topP: number;
    seed: number | null;
    stopSequence: string;
    template: boolean;
  };
}

/**
 * Default values for all run settings
 */
export const DEFAULT_RUN_SETTINGS: RunSettingsConfig = {
  // Model Configuration
  model: 'gemini-2.5-pro',
  systemInstructions: '',

  // Core Parameters
  temperature: 0.95,
  maxCompletionTokens: 8192,
  reasoning: 'medium',

  // Modes
  stream: true,
  jsonMode: false,

  // Built-in Tools
  builtInTools: {
    browserSearch: false,
    codeInterpreter: false,
  },

  // MCP Servers
  mcpServers: [],

  // Advanced Settings
  advanced: {
    moderation: false,
    topP: 1.0,
    seed: null,
    stopSequence: '',
    template: false,
  },
};

/**
 * Model options available for selection
 */
export const MODEL_OPTIONS = [
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Our most powerful reasoning model, which excels at coding and complex reasoning tasks.',
  },
  {
    value: 'gemini-flash-latest',
    label: 'Gemini Flash Latest',
    description: 'Fast and efficient model for quick responses.',
  },
  {
    value: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    description: 'Advanced model with extended context window.',
  },
] as const;

/**
 * Reasoning level options
 */
export const REASONING_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

/**
 * Parameter constraints
 */
export const PARAMETER_CONSTRAINTS = {
  temperature: { min: 0, max: 2, step: 0.01 },
  maxCompletionTokens: { min: 1, max: 8192, step: 1 },
  topP: { min: 0, max: 1, step: 0.01 },
} as const;
