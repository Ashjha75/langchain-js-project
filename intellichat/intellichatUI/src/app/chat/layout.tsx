import React from 'react';

interface ChatLayoutPageProps {
  children: React.ReactNode;
}

export default function ChatLayoutPage({ children }: ChatLayoutPageProps) {
  return <>{children}</>;
}