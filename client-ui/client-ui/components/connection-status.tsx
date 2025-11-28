'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  toolCount: number;
}

export function ConnectionStatus({ isConnected, error, toolCount }: ConnectionStatusProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm">
        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-red-700 dark:text-red-300">
          MCP Server Error: {error}
        </span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm">
        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-yellow-700 dark:text-yellow-300">
          Connecting to MCP server...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2 text-sm">
      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span className="text-green-700 dark:text-green-300">
        Connected to MCP server ({toolCount} tools available)
      </span>
    </div>
  );
}
