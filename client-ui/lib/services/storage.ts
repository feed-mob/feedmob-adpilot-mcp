import type { ChatSession, ChatMessage } from '../types';
import { serializeSession, deserializeSession } from '../serialization';

const SESSIONS_KEY = 'mcp-chat-sessions';
const CURRENT_SESSION_KEY = 'mcp-chat-current-session';

export class StorageService {
  /**
   * Get all chat sessions
   */
  getSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) return [];

      const sessions = JSON.parse(data);
      return sessions.map((s: any) => deserializeSession(JSON.stringify(s)));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Get a specific session by ID
   */
  getSession(id: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  /**
   * Save a session
   */
  saveSession(session: ChatSession): void {
    if (typeof window === 'undefined') return;

    try {
      const sessions = this.getSessions();
      const index = sessions.findIndex((s) => s.id === session.id);

      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Delete a session
   */
  deleteSession(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const sessions = this.getSessions();
      const filtered = sessions.filter((s) => s.id !== id);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));

      // Clear current session if it was deleted
      if (this.getCurrentSessionId() === id) {
        this.setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  /**
   * Create a new session
   */
  createSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      title: title || `Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveSession(session);
    this.setCurrentSessionId(session.id);

    return session;
  }

  /**
   * Update session messages
   */
  updateSessionMessages(sessionId: string, messages: ChatMessage[]): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.messages = messages;
    session.updatedAt = Date.now();

    this.saveSession(session);
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(CURRENT_SESSION_KEY);
  }

  /**
   * Set current session ID
   */
  setCurrentSessionId(id: string | null): void {
    if (typeof window === 'undefined') return;

    if (id) {
      localStorage.setItem(CURRENT_SESSION_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

// Singleton instance
let storageServiceInstance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService();
  }
  return storageServiceInstance;
}
