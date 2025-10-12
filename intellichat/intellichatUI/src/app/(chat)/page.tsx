'use client';

import { GeminiHomePage } from '@/components/GeminiHomePage_Refactored';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <GeminiHomePage />;
}
