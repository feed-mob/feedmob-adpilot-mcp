'use client';

import { useState, useEffect } from 'react';
import { ChatContainer } from '@/components/chat-container';
import { ChatHistory } from '@/components/chat-history';
import { getStorageService } from '@/lib/services/storage';
import type { ChatMessage } from '@/lib/types';

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const storage = getStorageService();

  useEffect(() => {
    // Load or create initial session
    const savedSessionId = storage.getCurrentSessionId();
    if (savedSessionId) {
      const session = storage.getSession(savedSessionId);
      if (session) {
        setCurrentSessionId(session.id);
        setInitialMessages(session.messages);
        return;
      }
    }

    // Create new session if none exists
    const newSession = storage.createSession();
    setCurrentSessionId(newSession.id);
    setInitialMessages([]);
  }, []);

  const handleMessagesChange = (messages: ChatMessage[]) => {
    if (currentSessionId) {
      storage.updateSessionMessages(currentSessionId, messages);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = storage.getSession(sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setInitialMessages(session.messages);
      storage.setCurrentSessionId(session.id);
    }
  };

  const handleNewSession = () => {
    const newSession = storage.createSession();
    setCurrentSessionId(newSession.id);
    setInitialMessages([]);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          FeedMob AdPilot
        </h1>
        <ChatHistory
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {currentSessionId && (
          <ChatContainer
            key={currentSessionId}
            initialMessages={initialMessages}
            onMessagesChange={handleMessagesChange}
          />
        )}
      </div>
    </div>
  );
}
