import { ChatLayout } from '@/components/chat/chat-layout';

interface ChatLayoutPageProps {
  children: React.ReactNode;
}

export default function ChatLayoutPage({ children }: ChatLayoutPageProps) {
  return <ChatLayout>{children}</ChatLayout>;
}