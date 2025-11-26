import { User } from '../types/user.js';

/**
 * Simple in-memory session store
 * In production, use Redis or another persistent store
 */
class SessionStore {
  private sessions: Map<string, { user: User; expiresAt: Date }>;

  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create a new session
   */
  createSession(sessionId: string, user: User, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): void {
    const expiresAt = new Date(Date.now() + expiresInMs);
    this.sessions.set(sessionId, { user, expiresAt });
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): User | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.user;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): string[] {
    const sessionIds: string[] = [];
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.user.id === userId && session.expiresAt >= now) {
        sessionIds.push(sessionId);
      }
    }

    return sessionIds;
  }

  /**
   * Delete all sessions for a user
   */
  deleteUserSessions(userId: string): void {
    const sessionIds = this.getUserSessions(userId);
    for (const sessionId of sessionIds) {
      this.sessions.delete(sessionId);
    }
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Clean up expired sessions every hour
setInterval(() => {
  sessionStore.cleanupExpiredSessions();
}, 60 * 60 * 1000);
