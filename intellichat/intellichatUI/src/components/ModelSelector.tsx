'use client';

import { FC, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { models } from '@/config/models';
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

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full flex justify-between items-center rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedModel?.metadata.display_name || 'Select a model'}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-sidebar-background border border-sidebar-border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full rounded-lg"
              />
            </div>
          </div>
          <div className="flex">
            <div className="max-h-60 w-60 overflow-y-auto">
              {Object.entries(filteredAndGroupedModels).map(([owner, modelList]) => (
                <div key={owner}>
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{owner}</p>
                  {modelList.map(model => (
                    <div
                      key={model.id}
                      className={`p-2 cursor-pointer hover:bg-accent ${value === model.id ? 'bg-accent' : ''}`}
                      onClick={() => {
                        onChange(model.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      onMouseEnter={() => setHoveredModel(model)}
                      onMouseLeave={() => setHoveredModel(null)}
                    >
                      <p className="text-sm">{model.metadata.display_name}</p>
                      <p className="text-xs text-muted-foreground">{model.id}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {hoveredModel && (
              <div className="border-l border-sidebar-border ml-2 pl-2">
                <ModelTooltip model={hoveredModel} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
