import { GeminiChatPage } from '@/components/GeminiChatPage_Fixed'

interface ConversationPageProps {
  params: {
    id: string
  }
}

export default function ConversationPage({ params }: ConversationPageProps) {
  return <GeminiChatPage />
}