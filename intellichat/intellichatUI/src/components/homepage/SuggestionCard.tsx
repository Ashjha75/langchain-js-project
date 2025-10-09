'use client';

import React from 'react';

interface SuggestionCardProps {
  card: {
    title: string;
    subtitle: string;
    icon: string;
  };
  onClick: (card: { title: string; subtitle: string }) => void;
}

export function SuggestionCard({ card, onClick }: SuggestionCardProps) {
  return (
    <button
      onClick={() => onClick(card)}
      className="bg-[#282a2c] p-6 rounded-2xl border border-[#333537] text-left text-[#e8eaed] hover:border-[#4285f4] transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{card.icon}</span>
        <div>
          <h3 className="text-[#e8eaed] font-medium mb-1">{card.title}</h3>
          <p className="text-[#9aa0a6] text-sm">{card.subtitle}</p>
        </div>
      </div>
    </button>
  );
}
