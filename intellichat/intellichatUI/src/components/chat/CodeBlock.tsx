'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Clipboard, Code, Download } from 'lucide-react';

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

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageIcon = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return '🟨';
      case 'typescript':
      case 'ts':
        return '🔷';
      case 'python':
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'bash':
      case 'shell':
        return '💻';
      default:
        return '📄';
    }
  };

  return (
    <div className="relative my-4 rounded-xl bg-[#0d1117] border border-[#21262d] shadow-2xl overflow-hidden font-mono text-sm">
      {/* Header with language info and actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getLanguageIcon()}</span>
          <span className="text-[#f0f6fc] font-medium capitalize">{language}</span>
          <span className="text-[#7d8590] text-xs">
            {value.split('\n').length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2 py-1 text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition-all duration-200"
            title="Download code"
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition-all duration-200"
            title={isCopied ? 'Copied!' : 'Copy code'}
          >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
            <span className="text-xs font-medium">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      
      {/* Code content */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            backgroundColor: '#0d1117',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#7d8590',
            backgroundColor: '#0d1117',
            paddingRight: '1rem',
            marginRight: '1rem',
            borderRight: '1px solid #21262d'
          }}
          codeTagProps={{ 
            style: { 
              fontFamily: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", monospace',
              fontWeight: '400'
            } 
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
      
      {/* Footer with code stats */}
      <div className="px-4 py-2 bg-[#161b22] border-t border-[#21262d] text-xs text-[#7d8590] flex justify-between">
        <span>{value.length} characters</span>
        <span>{value.split(' ').length} words</span>
      </div>
    </div>
  );
}
