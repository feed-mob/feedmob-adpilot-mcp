import {
  ChatMessage,
  ChatMessageSchema,
  ChatSession,
  ChatSessionSchema,
} from './types';

/**
 * Serialize a chat message to JSON string
 */
export function serializeMessage(message: ChatMessage): string {
  return JSON.stringify(message);
}

/**
 * Deserialize a JSON string to a chat message
 * Validates against schema and throws if invalid
 */
export function deserializeMessage(json: string): ChatMessage {
  const parsed = JSON.parse(json);
  return ChatMessageSchema.parse(parsed);
}

/**
 * Serialize a chat session to JSON string
 */
export function serializeSession(session: ChatSession): string {
  return JSON.stringify(session);
}

/**
 * Deserialize a JSON string to a chat session
 * Validates against schema and throws if invalid
 */
export function deserializeSession(json: string): ChatSession {
  const parsed = JSON.parse(json);
  return ChatSessionSchema.parse(parsed);
}

/**
 * Validate a message object against the schema
 * Returns true if valid, false otherwise
 */
export function isValidMessage(obj: unknown): obj is ChatMessage {
  const result = ChatMessageSchema.safeParse(obj);
  return result.success;
}

/**
 * Validate a session object against the schema
 * Returns true if valid, false otherwise
 */
export function isValidSession(obj: unknown): obj is ChatSession {
  const result = ChatSessionSchema.safeParse(obj);
  return result.success;
}
