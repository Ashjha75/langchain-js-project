'use client';

import { FC } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;