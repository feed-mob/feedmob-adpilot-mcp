import { z } from 'zod';

// UIResource Schema
export const UIResourceSchema = z.object({
  uri: z.string(),
  mimeType: z.string(),
  text: z.string().optional(),
  blob: z.string().optional(),
  _meta: z.record(z.unknown()).optional(),
});

export type UIResource = z.infer<typeof UIResourceSchema>;

// Message Content Schemas
export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const ToolUseContentSchema = z.object({
  type: z.literal('tool_use'),
  toolUseId: z.string(),
  name: z.string(),
  input: z.record(z.unknown()),
});

export const ToolResultContentItemSchema = z.union([
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('resource'), resource: UIResourceSchema }),
]);

export const ToolResultContentSchema = z.object({
  type: z.literal('tool_result'),
  toolUseId: z.string(),
  content: z.array(ToolResultContentItemSchema),
});

export const ResourceContentSchema = z.object({
  type: z.literal('resource'),
  resource: UIResourceSchema,
});

export const MessageContentSchema = z.union([
  TextContentSchema,
  ToolUseContentSchema,
  ToolResultContentSchema,
  ResourceContentSchema,
]);

export type TextContent = z.infer<typeof TextContentSchema>;
export type ToolUseContent = z.infer<typeof ToolUseContentSchema>;
export type ToolResultContent = z.infer<typeof ToolResultContentSchema>;
export type ResourceContent = z.infer<typeof ResourceContentSchema>;
export type MessageContent = z.infer<typeof MessageContentSchema>;

// Chat Message Schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'tool']),
  content: z.array(MessageContentSchema),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Chat Session Schema
export const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

// UIAction Types
export const UIActionSchema = z.object({
  type: z.enum(['tool', 'prompt', 'notify', 'link', 'intent']),
  payload: z.record(z.unknown()),
  messageId: z.string().optional(),
});

export type UIAction = z.infer<typeof UIActionSchema>;

export interface UIActionResult {
  status: string;
  result?: unknown;
  error?: string;
}

// Tool Definition
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

// Tool Result
export interface ToolResult {
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'resource'; resource: UIResource }
  >;
  isError?: boolean;
}
