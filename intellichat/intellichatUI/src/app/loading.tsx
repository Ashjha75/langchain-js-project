import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function LoadingPage() {
  return (
    <ErrorBoundary>
      <LoadingScreen message="Loading IntelliChat Pro..." />
    </ErrorBoundary>
  );
}