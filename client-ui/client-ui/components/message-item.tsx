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
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`relative max-w-full px-6 py-4 rounded-2xl ${isUser
          ? 'bg-blue-600 text-white shadow-sm'
          : message.role === 'tool'
            ? 'bg-gray-50 text-gray-900 border border-gray-100'
            : 'bg-white text-gray-900 shadow-sm border border-gray-100'
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
              <div key={index} className="space-y-4 mt-2">
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
