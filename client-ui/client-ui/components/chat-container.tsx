'use client';

import { useState, useEffect } from 'react';
import type { ChatMessage, ToolDefinition } from '@/lib/types';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { ConnectionStatus } from './connection-status';

export interface ChatContainerProps {
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatContainer({ initialMessages = [], onMessagesChange }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolDefinition[]>([]);

  // Check MCP connection on mount
  useEffect(() => {
    const checkMCPConnection = async () => {
      try {
        const response = await fetch('/api/mcp/tools');
        const data = await response.json();
        
        if (response.ok && data.tools) {
          setIsConnected(true);
          setTools(data.tools);
          setConnectionError(null);
        } else {
          setConnectionError(data.error || 'Failed to connect to MCP server');
          setIsConnected(false);
        }
      } catch (error: any) {
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    checkMCPConnection();
  }, []);

  // Notify parent of message changes
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateLastMessage = (updater: (msg: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0) {
        newMessages[lastIndex] = updater(newMessages[lastIndex]);
      }
      return newMessages;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: [{ type: 'text', text }],
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Create assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: [],
      timestamp: Date.now(),
    };
    addMessage(assistantMessage);

    try {
      // Stream response from server-side Bedrock proxy
      const conversationMessages = [...messages, userMessage];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          tools: tools.length > 0 ? tools : undefined,
        }),
      });

      if (!response.body) {
        throw new Error('No response stream from server');
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to start chat stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;

          const payload = line.slice(5).trim();
          if (payload === '[DONE]') {
            return;
          }

          let event: any;
          try {
            event = JSON.parse(payload);
          } catch {
            console.warn('Failed to parse stream chunk', payload);
            continue;
          }

          if (event.type === 'text' && event.content) {
            updateLastMessage((msg) => {
              const lastContent = msg.content[msg.content.length - 1];
              if (lastContent?.type === 'text') {
                return {
                  ...msg,
                  content: [
                    ...msg.content.slice(0, -1),
                    { type: 'text', text: lastContent.text + event.content },
                  ],
                };
              }
              return {
                ...msg,
                content: [...msg.content, { type: 'text', text: event.content! }],
              };
            });
          } else if (event.type === 'tool_use' && event.toolUse) {
            addMessage({
              id: `tool-${event.toolUse.toolUseId}`,
              role: 'assistant',
              content: [
                { type: 'text', text: `Calling tool: ${event.toolUse.name}` },
                { type: 'text', text: `Params: ${JSON.stringify(event.toolUse.input, null, 2)}` },
              ],
              timestamp: Date.now(),
            });
          } else if (event.type === 'error' && event.error) {
            throw new Error(event.error as string);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 p-4">
        <ConnectionStatus
          isConnected={isConnected}
          error={connectionError}
          toolCount={tools.length}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {error && (
        <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
        <ChatInput onSend={handleSendMessage} disabled={isLoading || !isConnected} />
      </div>
    </div>
  );
}
