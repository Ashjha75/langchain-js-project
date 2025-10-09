import { Suspense } from 'react';

import { ChatContainer } from '@/components/chat/chat-container';
import { ChatSkeleton } from '@/components/ui/skeletons';

export default function NewChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatContainer conversationId={null} />
    </Suspense>
  );
}