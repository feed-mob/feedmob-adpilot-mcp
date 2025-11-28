'use client';

import { Wrench } from 'lucide-react';

export interface ToolCallMessageProps {
  toolUseId: string;
  name: string;
  input: Record<string, unknown>;
}

export function ToolCallMessage({ toolUseId, name, input }: ToolCallMessageProps) {
  return (
    <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-sm text-blue-900">
          Tool Call: {name}
        </span>
      </div>
      <div className="text-xs text-gray-600 font-mono">
        <div className="mb-1">
          <span className="font-semibold">ID:</span> {toolUseId}
        </div>
        {Object.keys(input).length > 0 && (
          <div>
            <span className="font-semibold">Parameters:</span>
            <pre className="mt-1 p-2 bg-white rounded overflow-x-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
