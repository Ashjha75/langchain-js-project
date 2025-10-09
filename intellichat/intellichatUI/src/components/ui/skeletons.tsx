import { FC } from 'react';

export const ChatSkeleton: FC = () => {
  return (
    <div className="flex h-full flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-6 w-32 bg-gray-300 rounded dark:bg-gray-700"></div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User message skeleton */}
        <div className="flex justify-end">
          <div className="max-w-xs lg:max-w-md">
            <div className="h-4 bg-blue-300 rounded mb-2 dark:bg-blue-700"></div>
            <div className="h-4 bg-blue-300 rounded w-3/4 dark:bg-blue-700"></div>
          </div>
        </div>

        {/* AI message skeleton */}
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex justify-end">
          <div className="max-w-xs lg:max-w-md">
            <div className="h-4 bg-blue-300 rounded mb-2 dark:bg-blue-700"></div>
            <div className="h-4 bg-blue-300 rounded w-1/2 dark:bg-blue-700"></div>
          </div>
        </div>

        {/* AI message skeleton */}
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex space-x-2">
          <div className="flex-1 h-10 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
          <div className="w-16 h-10 bg-blue-300 rounded-lg dark:bg-blue-700"></div>
        </div>
      </div>
    </div>
  );
};

export const MessageSkeleton: FC = () => {
  return (
    <div className="animate-pulse">
      <div className="flex space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

export const ConversationSkeleton: FC = () => {
  return (
    <div className="animate-pulse p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 dark:bg-gray-700"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};