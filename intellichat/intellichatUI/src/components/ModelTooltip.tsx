import { FC } from 'react';
import { AIModel } from '@/lib/models-api';

interface ModelTooltipProps {
  model: AIModel;
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
        <div className="w-8 h-8 bg-[#2c2c2c] rounded-md ml-3 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src="/images/aigif.webp"
            alt="Model animation"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Model Features */}
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2.5 uppercase tracking-wider">Features</p>
          <div className="bg-[#282a2c] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${model.features.chat ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <p className="text-xs text-[#e8eaed]">Chat</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${model.features.tools ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <p className="text-xs text-[#e8eaed]">Tools</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${model.features.json_mode ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <p className="text-xs text-[#e8eaed]">JSON Mode</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${model.features.is_batch_enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <p className="text-xs text-[#e8eaed]">Batch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Context Window */}
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2 uppercase tracking-wider">Context Window</p>
          <div className="bg-[#282a2c] rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-[#e8eaed]">{formatNumber(model.context_window)} tokens</p>
          </div>
        </div>

        {/* Max Completion Tokens */}
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2 uppercase tracking-wider">Max Output</p>
          <div className="bg-[#282a2c] rounded-lg px-3 py-2">
            <p className="text-sm font-medium text-[#e8eaed]">{formatNumber(model.max_completion_tokens)} tokens</p>
          </div>
        </div>

        {/* Rate Limits */}
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2.5 uppercase tracking-wider">Rate Limits</p>
          <div className="bg-[#282a2c] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <div>
                <p className="text-[#9aa0a6] text-xs mb-1">Requests</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.requests_per_minute)} / min</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.requests_per_day)} / day</p>
              </div>
              <div>
                <p className="text-[#9aa0a6] text-xs mb-1">Tokens</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.tokens_per_minute)} / min</p>
                <p className="font-semibold text-[#e8eaed] text-sm">{formatNumber(model.metadata.limits.tokens_per_day)} / day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Release Stage */}
        <div>
          <p className="text-xs font-semibold text-[#9aa0a6] mb-2 uppercase tracking-wider">Release Stage</p>
          <div className="bg-[#282a2c] rounded-lg px-3 py-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              model.metadata.release_stage === 'production' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {model.metadata.release_stage}
            </span>
          </div>
        </div>

        {/* Created Date */}
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
