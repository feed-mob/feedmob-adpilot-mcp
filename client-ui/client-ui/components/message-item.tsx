'use client';

import type { ChatMessage } from '@/lib/types';
import { TextMessage } from './text-message';
import { ToolCallMessage } from './tool-call-message';
import { UIResourceMessage } from './ui-resource-message';

export interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`w-full max-w-6xl rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : message.role === 'tool'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
        }`}
      >
        {message.content.map((content, index) => {
          if (content.type === 'text') {
            return <TextMessage key={index} text={content.text} />;
          } else if (content.type === 'tool_use') {
            return (
              <ToolCallMessage
                key={index}
                toolUseId={content.toolUseId}
                name={content.name}
                input={content.input}
              />
            );
          } else if (content.type === 'tool_result') {
            return (
              <div key={index} className="space-y-2">
                {content.content.map((item, itemIndex) => {
                  if (item.type === 'text') {
                    return <TextMessage key={itemIndex} text={item.text} />;
                  } else if (item.type === 'resource') {
                    return <UIResourceMessage key={itemIndex} resource={item.resource} />;
                  }
                  return null;
                })}
              </div>
            );
          } else if (content.type === 'resource') {
            return <UIResourceMessage key={index} resource={content.resource} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
