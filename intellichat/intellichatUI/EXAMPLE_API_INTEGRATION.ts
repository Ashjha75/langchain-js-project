/**
 * Example: Chat API Route with Run Settings Integration
 * Place this in: app/api/chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatSettingsForGeminiAPI } from '@/lib/formatRunSettings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      message,
      // All run settings will be automatically included here
      model,
      temperature,
      maxCompletionTokens,
      systemInstructions,
      stream,
      jsonMode,
      builtInTools,
      advanced,
      ...otherSettings
    } = body;

    // Example: Call Gemini API
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    const geminiPayload = {
      contents: [
        {
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: temperature ?? 0.95,
        maxOutputTokens: maxCompletionTokens ?? 8192,
        topP: advanced?.topP ?? 1.0,
        ...(advanced?.seed && { seed: advanced.seed }),
        ...(advanced?.stopSequence && { stopSequences: [advanced.stopSequence] }),
        ...(jsonMode && { responseMimeType: 'application/json' }),
      },
      ...(systemInstructions && {
        systemInstruction: {
          parts: [{ text: systemInstructions }]
        }
      }),
    };

    // Add tools if enabled
    if (builtInTools?.browserSearch || builtInTools?.codeInterpreter) {
      geminiPayload.tools = [];
      
      if (builtInTools.browserSearch) {
        geminiPayload.tools.push({ googleSearch: {} });
      }
      
      if (builtInTools.codeInterpreter) {
        geminiPayload.tools.push({ codeExecution: {} });
      }
    }

    const modelName = model || 'gemini-2.5-pro';
    const endpoint = stream 
      ? `https://generativelanguage.googleapis.com/v1/models/${modelName}:streamGenerateContent`
      : `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Return JSON response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
