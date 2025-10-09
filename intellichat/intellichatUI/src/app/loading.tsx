import { ErrorBoundary, LoadingScreen } from '@/components/ui';

export default function LoadingPage() {
  return (
    <ErrorBoundary>
      <LoadingScreen message="Loading IntelliChat Pro..." />
    </ErrorBoundary>
  );
}