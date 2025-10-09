import { FC } from 'react';

interface ChatContainerProps {
  conversationId: string;
}

export const ChatContainer: FC<ChatContainerProps> = ({ conversationId }) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Chat {conversationId}
            </h1>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Placeholder for messages */}
              <div className="flex justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Start a conversation...
                </p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};