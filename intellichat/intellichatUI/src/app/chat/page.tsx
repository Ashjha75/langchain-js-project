import { redirect } from 'next/navigation';

export default function ChatPage() {
  // Redirect to new chat
  redirect('/chat/new');
}