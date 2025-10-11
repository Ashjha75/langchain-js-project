'use client';

import { FC, useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import modelsAPI, { AIModel } from '@/lib/models-api';
import ModelTooltip from './ModelTooltip';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface Model {
  id: string;
  created: number;
  owned_by: string;
  metadata: {
    display_name: string;
    release_stage: string;
    limits: {
      requests_per_minute: number;
      tokens_per_minute: number;
      requests_per_day: number;
      tokens_per_day: number;
    };
  };
}

export const ModelSelector: FC<ModelSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredModel, setHoveredModel] = useState<Model | null>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch models from database on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedModels = await modelsAPI.getModels();
        setModels(fetchedModels);
      } catch (err: any) {
        console.error('Failed to load models:', err);
        setError('Failed to load models. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Update button position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHoveredModel(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredAndGroupedModels = useMemo(() => {
    const filtered = models.filter(model =>
      model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.metadata.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, model) => {
      const owner = model.owned_by;
      if (!acc[owner]) {
        acc[owner] = [];
      }
      acc[owner].push(model);
      return acc;
    }, {} as Record<string, Model[]>);
  }, [searchTerm]);

  const selectedModel = models.find(m => m.id === value);

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading models...
      </Button>
    );
  }

  // Show error state
  if (error) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <span className="text-red-500">{error}</span>
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="outline"
        className="w-full flex justify-between items-center rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedModel?.metadata.display_name || 'Select a model'}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />}
      </Button>
      {isOpen && buttonRect && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[99999] flex flex-row-reverse gap-0"
          style={{
            right: `${window.innerWidth - buttonRect.right}px`,
            top: `${buttonRect.bottom + 8}px`,
          }}
        >
          {/* Main Dropdown (appears on right due to flex-row-reverse) */}
          <div className="w-80 bg-[#1e1e1e] border border-[#333537] rounded-lg shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-[#333537]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa0a6]" />
                <Input
                  placeholder="Search Models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-[#282a2c] border-[#404040] text-[#e8eaed] placeholder:text-[#9aa0a6] focus:border-[#4285f4] rounded-lg"
                  autoFocus
                />
              </div>
            </div>
            <div 
              className="max-h-96 overflow-y-auto model-dropdown-scroll"
              onMouseLeave={() => setHoveredModel(null)}
            >
              {Object.entries(filteredAndGroupedModels).length === 0 ? (
                <div className="p-4 text-center text-[#9aa0a6] text-sm">
                  No models found
                </div>
              ) : (
                Object.entries(filteredAndGroupedModels).map(([owner, modelList]) => (
                  <div key={owner}>
                    <div className="px-3 py-2 bg-[#282a2c] sticky top-0">
                      <p className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-wider">{owner}</p>
                    </div>
                    {modelList.map(model => (
                      <div
                        key={model.id}
                        className={`px-3 py-2.5 cursor-pointer transition-all duration-150 hover:bg-[#2c2c2c] border-l-2 ${
                          value === model.id 
                            ? 'bg-[#2c2c2c] border-l-[#4285f4]' 
                            : 'border-l-transparent'
                        }`}
                        onClick={() => {
                          onChange(model.id);
                          setIsOpen(false);
                          setSearchTerm('');
                          setHoveredModel(null);
                        }}
                        onMouseEnter={() => setHoveredModel(model)}
                      >
                        <p className="text-sm font-medium text-[#e8eaed]">{model.metadata.display_name}</p>
                        <p className="text-xs text-[#9aa0a6] truncate mt-0.5">{model.id}</p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Tooltip on the left (appears left due to flex-row-reverse) */}
          {hoveredModel && (
            <div>
              <ModelTooltip model={hoveredModel} />
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default ModelSelector;
