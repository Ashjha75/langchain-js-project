import { redirect } from 'next/navigation';

import { LoadingScreen } from '@/components/ui/loading-screen';

export default function HomePage() {
  // Redirect to chat page
  redirect('/chat');
  
  // This won't render due to redirect, but included for completeness
  return <LoadingScreen message="Redirecting to chat..." />;
}