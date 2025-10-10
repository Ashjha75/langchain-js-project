import React from 'react';
import AuthGuard from '@/components/AuthGuard';

interface ChatLayoutPageProps {
  children: React.ReactNode;
}

export default function ChatLayoutPage({ children }: ChatLayoutPageProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
