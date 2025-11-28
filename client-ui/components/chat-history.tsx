'use client';

import { useState, useEffect } from 'react';
import { History, Plus, Trash2 } from 'lucide-react';
import type { ChatSession } from '@/lib/types';
import { getStorageService } from '@/lib/services/storage';

export interface ChatHistoryProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export function ChatHistory({ currentSessionId, onSelectSession, onNewSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const storage = getStorageService();

  useEffect(() => {
    loadSessions();
  }, [currentSessionId]);

  const loadSessions = () => {
    const allSessions = storage.getSessions();
    // Sort by updated time, most recent first
    allSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    setSessions(allSessions);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      storage.deleteSession(sessionId);
      loadSessions();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <History className="w-4 h-4" />
        <span>History</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  onNewSession();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            <div className="p-2">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No chat history yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${session.id === currentSessionId
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.messages.length} messages · {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
