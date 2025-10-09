import { Suspense } from 'react';

import { ChatContainer } from '@/components/chat/chat-container';
import { ChatSkeleton } from '@/components/ui/skeletons';

interface ConversationPageProps {
  params: {
    id: string;
  };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatContainer conversationId={params.id} />
    </Suspense>
  );
}