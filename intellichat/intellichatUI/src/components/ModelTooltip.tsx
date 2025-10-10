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
    <div className="w-80 max-h-96 overflow-y-auto model-dropdown-scroll bg-[#1e1e1e] border border-[#333537] rounded-lg shadow-2xl p-4">
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#333537]">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base text-[#e8eaed] mb-1">{model.metadata.display_name}</p>
          <p className="text-xs text-[#9aa0a6] break-words">{model.id}</p>
        </div>
        {/* Placeholder for logo */}
        <div className="w-8 h-8 bg-[#2c2c2c] rounded-md ml-3 flex-shrink-0 flex items-center justify-center">
          <span className="text-xs text-[#9aa0a6]">📦</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2.5 uppercase tracking-wider">Limits</p>
          <div className="bg-[#282a2c] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div>
                <p className="text-[#9aa0a6] text-xs mb-1">Requests</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.requests_per_minute)} / minute</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.requests_per_day)} / day</p>
              </div>
              <div>
                <p className="text-[#9aa0a6] text-xs mb-1">Tokens</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.tokens_per_minute)} / minute</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.tokens_per_day)} / day</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2 uppercase tracking-wider">Release Stage</p>
          <div className="bg-[#282a2c] rounded-lg px-3 py-2">
            <p className="text-sm capitalize font-medium text-[#e8eaed]">{model.metadata.release_stage}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2 uppercase tracking-wider">Released</p>
          <div className="bg-[#282a2c] rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-[#e8eaed]">{formatDate(model.created)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelTooltip;
