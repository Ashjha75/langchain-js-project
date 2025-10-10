/**
 * Utility functions for formatting Run Settings for API requests
 */

import { RunSettingsConfig } from '@/config/runSettingsDefaults';

/**
 * Format settings for Gemini API request
 * Converts our internal settings format to Gemini API format
 */
export function formatSettingsForGeminiAPI(settings: Partial<RunSettingsConfig>) {
  const apiPayload: Record<string, any> = {};

  // Model configuration
  if (settings.model) {
    apiPayload.model = settings.model;
  }

  if (settings.systemInstructions) {
    apiPayload.systemInstruction = settings.systemInstructions;
  }

  // Generation config
  const generationConfig: Record<string, any> = {};
  
  if (settings.temperature !== undefined) {
    generationConfig.temperature = settings.temperature;
  }

  if (settings.maxCompletionTokens !== undefined) {
    generationConfig.maxOutputTokens = settings.maxCompletionTokens;
  }

  if (settings.advanced?.topP !== undefined) {
    generationConfig.topP = settings.advanced.topP;
  }

  if (settings.advanced?.seed !== undefined && settings.advanced.seed !== null) {
    generationConfig.seed = settings.advanced.seed;
  }

  if (settings.advanced?.stopSequence) {
    generationConfig.stopSequences = [settings.advanced.stopSequence];
  }

  if (settings.jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  if (Object.keys(generationConfig).length > 0) {
    apiPayload.generationConfig = generationConfig;
  }

  // Tools configuration
  const tools: any[] = [];

  if (settings.builtInTools?.browserSearch) {
    tools.push({
      googleSearch: {}
    });
  }

  if (settings.builtInTools?.codeInterpreter) {
    tools.push({
      codeExecution: {}
    });
  }

  if (tools.length > 0) {
    apiPayload.tools = tools;
  }

  // Safety settings (moderation)
  if (settings.advanced?.moderation) {
    apiPayload.safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ];
  }

  return apiPayload;
}

/**
 * Format settings for OpenAI-compatible API
 */
export function formatSettingsForOpenAIAPI(settings: Partial<RunSettingsConfig>) {
  const apiPayload: Record<string, any> = {};

  if (settings.model) {
    apiPayload.model = settings.model;
  }

  if (settings.temperature !== undefined) {
    apiPayload.temperature = settings.temperature;
  }

  if (settings.maxCompletionTokens !== undefined) {
    apiPayload.max_tokens = settings.maxCompletionTokens;
  }

  if (settings.advanced?.topP !== undefined) {
    apiPayload.top_p = settings.advanced.topP;
  }

  if (settings.advanced?.seed !== undefined && settings.advanced.seed !== null) {
    apiPayload.seed = settings.advanced.seed;
  }

  if (settings.advanced?.stopSequence) {
    apiPayload.stop = [settings.advanced.stopSequence];
  }

  if (settings.stream !== undefined) {
    apiPayload.stream = settings.stream;
  }

  if (settings.jsonMode) {
    apiPayload.response_format = { type: 'json_object' };
  }

  if (settings.systemInstructions) {
    apiPayload.system = settings.systemInstructions;
  }

  return apiPayload;
}

/**
 * Get a summary of active (non-default) settings for display
 */
export function getSettingsSummary(changedSettings: Partial<RunSettingsConfig>): string[] {
  const summary: string[] = [];

  if (changedSettings.model) {
    summary.push(`Model: ${changedSettings.model}`);
  }

  if (changedSettings.temperature !== undefined) {
    summary.push(`Temperature: ${changedSettings.temperature}`);
  }

  if (changedSettings.maxCompletionTokens !== undefined) {
    summary.push(`Max Tokens: ${changedSettings.maxCompletionTokens}`);
  }

  if (changedSettings.reasoning) {
    summary.push(`Reasoning: ${changedSettings.reasoning}`);
  }

  if (changedSettings.stream !== undefined) {
    summary.push(`Stream: ${changedSettings.stream ? 'ON' : 'OFF'}`);
  }

  if (changedSettings.jsonMode) {
    summary.push('JSON Mode: ON');
  }

  if (changedSettings.builtInTools?.browserSearch) {
    summary.push('Browser Search: ON');
  }

  if (changedSettings.builtInTools?.codeInterpreter) {
    summary.push('Code Interpreter: ON');
  }

  return summary;
}
