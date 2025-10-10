import { FC } from 'react';

interface Model {
  id: string;
  created: number;
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

interface ModelTooltipProps {
  model: Model;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
    }
    return num;
}

export const ModelTooltip: FC<ModelTooltipProps> = ({ model }) => {
  return (
    <div className="w-64 p-4 bg-sidebar-background text-white rounded-lg shadow-lg border border-sidebar-border">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-bold">{model.metadata.display_name}</p>
          <p className="text-xs text-muted-foreground">{model.id}</p>
        </div>
        {/* Placeholder for logo */}
        <div className="w-6 h-6 bg-gray-700 rounded"></div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">LIMITS</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <p className="text-muted-foreground">Requests</p>
          <p className="text-muted-foreground">Tokens</p>
          <p>{formatNumber(model.metadata.limits.requests_per_minute)} / minute</p>
          <p>{formatNumber(model.metadata.limits.tokens_per_minute)} / minute</p>
          <p>{formatNumber(model.metadata.limits.requests_per_day)} / day</p>
          <p>{formatNumber(model.metadata.limits.tokens_per_day)} / day</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">RELEASE STAGE</p>
        <p className="text-sm capitalize">{model.metadata.release_stage}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">RELEASED</p>
        <p className="text-sm">{formatDate(model.created)}</p>
      </div>
    </div>
  );
};

export default ModelTooltip;
