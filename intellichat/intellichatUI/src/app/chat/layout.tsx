import { ChatLayout } from '@/components/chat';

interface ChatLayoutPageProps {
  children: React.ReactNode;
}

export default function ChatLayoutPage({ children }: ChatLayoutPageProps) {
  return <ChatLayout>{children}</ChatLayout>;
}