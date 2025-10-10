/**
 * QUICK START EXAMPLE
 * Copy and paste this code to get started quickly
 */

// ============================================
// STEP 1: Wrap Your App (layout.tsx)
// ============================================
/*
import { RunSettingsProvider } from '@/contexts/RunSettingsContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RunSettingsProvider>
          {children}
        </RunSettingsProvider>
      </body>
    </html>
  );
}
*/

// ============================================
// STEP 2: Use in Any Component
// ============================================
/*
import { useRunSettingsContext } from '@/contexts/RunSettingsContext';
import { formatSettingsForGeminiAPI } from '@/lib/formatRunSettings';

export function ChatPage() {
  const { settings, changedSettings, getApiPayload, resetSettings } = useRunSettingsContext();

  // Send message with settings
  const sendMessage = async (message: string) => {
    const settingsPayload = getApiPayload(); // Only changed settings
    const apiPayload = formatSettingsForGeminiAPI(settingsPayload);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        ...apiPayload
      })
    });
    
    return response.json();
  };

  // Display current settings
  console.log('Current model:', settings.model);
  console.log('Current temperature:', settings.temperature);
  console.log('Changed settings:', changedSettings);

  return (
    <div>
      <button onClick={() => sendMessage('Hello!')}>
        Send Message
      </button>
      <button onClick={resetSettings}>
        Reset All Settings
      </button>
    </div>
  );
}
*/

// ============================================
// STEP 3: Backend API Route (api/chat/route.ts)
// ============================================
/*
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const {
    message,
    model = 'gemini-2.5-pro',
    temperature = 0.95,
    maxOutputTokens = 8192,
    systemInstruction,
    // ... all other settings automatically included
  } = body;

  // Call your AI API with these settings
  const response = await fetch(`YOUR_AI_API_URL`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.API_KEY}` },
    body: JSON.stringify({
      prompt: message,
      model,
      temperature,
      max_tokens: maxOutputTokens,
      system: systemInstruction,
    })
  });

  return NextResponse.json(await response.json());
}
*/

// ============================================
// BONUS: Access Settings Anywhere
// ============================================
/*
// In any component:
import { useRunSettingsContext } from '@/contexts/RunSettingsContext';

function AnyComponent() {
  const { settings, updateSetting } = useRunSettingsContext();
  
  // Read any setting
  const currentTemp = settings.temperature;
  const currentModel = settings.model;
  
  // Update any setting
  const handleModelChange = () => {
    updateSetting('model', 'gemini-flash-latest');
  };
  
  // Update nested setting
  const enableBrowserSearch = () => {
    updateSetting('builtInTools', {
      ...settings.builtInTools,
      browserSearch: true
    });
  };
  
  return <div>...</div>;
}
*/

// ============================================
// BONUS: Display Settings Summary
// ============================================
/*
import { getSettingsSummary } from '@/lib/formatRunSettings';

function SettingsDisplay() {
  const { changedSettings } = useRunSettingsContext();
  const summary = getSettingsSummary(changedSettings);

  return (
    <div>
      <h3>Active Customizations:</h3>
      {summary.length === 0 ? (
        <p>Using default settings</p>
      ) : (
        <ul>
          {summary.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/

// ============================================
// That's it! You're ready to go! 🚀
// ============================================
