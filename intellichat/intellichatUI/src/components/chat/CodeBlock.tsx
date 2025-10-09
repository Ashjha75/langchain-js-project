'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Clipboard } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-[#1e1e1e] font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
        >
          {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
          <span className="text-xs">{isCopied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '0 0 0.5rem 0.5rem' }}
        codeTagProps={{ style: { fontFamily: 'var(--font-jetbrains-mono)' } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
