'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ui';
import { Toaster } from '@/components/ui';
import { TooltipProvider } from '@/components/ui';
import { RunSettingsProvider } from '@/contexts/RunSettingsContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create a new QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 401/403/404
              if (error instanceof Error) {
                const status = (error as any)?.status;
                if ([401, 403, 404].includes(status)) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <RunSettingsProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </RunSettingsProvider>
        </ThemeProvider>
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}