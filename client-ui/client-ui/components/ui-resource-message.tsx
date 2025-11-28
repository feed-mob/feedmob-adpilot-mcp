'use client';

import { useState } from 'react';
import { UIResourceRenderer } from '@mcp-ui/client';
import type { UIResource, UIAction, UIActionResult } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export interface UIResourceMessageProps {
  resource: UIResource;
}

export function UIResourceMessage({ resource }: UIResourceMessageProps) {
  const [error, setError] = useState<string | null>(null);

  const handleUIAction = async (action: UIAction): Promise<UIActionResult> => {
    try {
      if (action.type === 'tool') {
        // Execute MCP tool via API
        const toolName = (action.payload as any).toolName;
        const params = (action.payload as any).params || {};

        const response = await fetch('/api/mcp/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: toolName, params }),
        });

        const result = await response.json();

        return {
          status: 'handled',
          result: result.content,
        };
      } else if (action.type === 'prompt') {
        // Display prompt to user
        const promptText = (action.payload as any).prompt;
        const userInput = window.prompt(promptText);

        return {
          status: 'handled',
          result: userInput,
        };
      } else if (action.type === 'notify') {
        // Show notification
        const message = (action.payload as any).message;
        alert(message);

        return {
          status: 'handled',
        };
      } else if (action.type === 'link') {
        // Open link in new tab
        const url = (action.payload as any).url;
        window.open(url, '_blank');

        return {
          status: 'handled',
        };
      } else if (action.type === 'intent') {
        // Handle intent
        console.log('Intent action:', action.payload);

        return {
          status: 'handled',
        };
      }

      return {
        status: 'unhandled',
      };
    } catch (error: any) {
      console.error('Error handling UI action:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  };

  // Check if this is a UIResource (has ui:// URI)
  if (!resource.uri?.startsWith('ui://')) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Resource: {resource.uri}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Failed to render UI component</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="my-4">
        <UIResourceRenderer
          resource={resource}
          onUIAction={handleUIAction}
          htmlProps={{
            autoResizeIframe: true,
            style: {
              width: '100%',
              minHeight: '200px',
              border: 'none',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    );
  } catch (error: any) {
    setError(error.message);
    return (
      <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Failed to render UI component</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }
}
