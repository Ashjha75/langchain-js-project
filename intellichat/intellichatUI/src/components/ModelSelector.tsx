'use client';

import { useState } from 'react';
import { ChevronDownIcon, SparklesIcon } from 'lucide-react';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('IntelliChat Pro');

  const models = [
    { name: 'IntelliChat Pro', description: 'Most capable model' },
    { name: 'IntelliChat Standard', description: 'Faster responses' },
    { name: 'IntelliChat Code', description: 'Optimized for coding' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border border-[#21262d] rounded-lg hover:border-[#1f6feb] transition-colors"
      >
        <SparklesIcon className="w-4 h-4 text-[#1f6feb]" />
        <span className="text-sm font-medium">{selectedModel}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-[#161b22] border border-[#21262d] rounded-lg shadow-lg z-50">
          {models.map((model) => (
            <button
              key={model.name}
              onClick={() => {
                setSelectedModel(model.name);
                setIsOpen(false);
              }}
              className="w-full text-left p-3 hover:bg-[#21262d] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium text-white">{model.name}</div>
              <div className="text-sm text-gray-400">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}