'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, ToolDefinition } from '@/lib/types';
import { getBedrockService } from '@/lib/services/bedrock';
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

  const bedrockService = useRef(getBedrockService());

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
      // Stream response from Bedrock
      const conversationMessages = [...messages, userMessage];
      
      for await (const event of bedrockService.current.converseStream({
        messages: conversationMessages,
        tools: tools.length > 0 ? tools : undefined,
      })) {
        if (event.type === 'text' && event.content) {
          // Append text to assistant message
          updateLastMessage((msg) => {
            const lastContent = msg.content[msg.content.length - 1];
            if (lastContent?.type === 'text') {
              // Append to existing text content
              return {
                ...msg,
                content: [
                  ...msg.content.slice(0, -1),
                  { type: 'text', text: lastContent.text + event.content },
                ],
              };
            } else {
              // Add new text content
              return {
                ...msg,
                content: [...msg.content, { type: 'text', text: event.content! }],
              };
            }
          });
        } else if (event.type === 'tool_use' && event.toolUse) {
          // Add tool use to assistant message
          updateLastMessage((msg) => ({
            ...msg,
            content: [
              ...msg.content,
              {
                type: 'tool_use',
                toolUseId: event.toolUse!.toolUseId,
                name: event.toolUse!.name,
                input: event.toolUse!.input,
              },
            ],
          }));

          // Execute the tool via API
          const toolResponse = await fetch('/api/mcp/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: event.toolUse.name,
              params: event.toolUse.input,
            }),
          });
          const toolResult = await toolResponse.json();

          // Add tool result message
          const toolResultMessage: ChatMessage = {
            id: `tool-${Date.now()}`,
            role: 'tool',
            content: [
              {
                type: 'tool_result',
                toolUseId: event.toolUse.toolUseId,
                content: toolResult.content,
              },
            ],
            timestamp: Date.now(),
          };
          addMessage(toolResultMessage);
        } else if (event.type === 'error') {
          setError(event.error || 'An error occurred');
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
