import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  type ConverseStreamCommandInput,
  type ConverseStreamOutput,
  type Message as BedrockMessage,
  type Tool as BedrockTool,
} from '@aws-sdk/client-bedrock-runtime';
import { getEnv } from '../env';
import type { ChatMessage, ToolDefinition } from '../types';

export interface StreamEvent {
  type: 'text' | 'tool_use' | 'stop' | 'error';
  content?: string;
  toolUse?: {
    toolUseId: string;
    name: string;
    input: Record<string, unknown>;
  };
  error?: string;
}

export interface ConverseParams {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  systemPrompt?: string;
}

export class BedrockService {
  private client: BedrockRuntimeClient | null = null;
  private modelId: string;

  constructor() {
    try {
      const env = getEnv();
      this.client = new BedrockRuntimeClient({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.modelId = env.BEDROCK_MODEL_ID;
    } catch (error) {
      console.error('Failed to initialize Bedrock client:', error);
      this.client = null;
      this.modelId = '';
    }
  }

  /**
   * Check if the Bedrock service is properly configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Convert chat messages to Bedrock format
   */
  private convertMessages(messages: ChatMessage[]): BedrockMessage[] {
    return messages
      .filter((msg) => msg.role !== 'tool') // Filter out tool messages
      .map((msg) => {
        const content = msg.content
          .filter((c) => c.type === 'text')
          .map((c) => ({
            text: (c as any).text,
          }));

        return {
          role: msg.role === 'user' ? 'user' : 'assistant',
          content,
        } as BedrockMessage;
      });
  }

  /**
   * Convert tool definitions to Bedrock format
   */
  private convertTools(tools: ToolDefinition[]): BedrockTool[] {
    return tools.map((tool) => ({
      toolSpec: {
        name: tool.name,
        description: tool.description,
        inputSchema: {
          json: tool.inputSchema,
        },
      },
    })) as BedrockTool[];
  }

  /**
   * Stream a conversation with Bedrock using ConverseStream API
   */
  async *converseStream(params: ConverseParams): AsyncGenerator<StreamEvent> {
    if (!this.client) {
      yield {
        type: 'error',
        error: 'Bedrock client not configured. Please check your AWS credentials.',
      };
      return;
    }

    try {
      const input: ConverseStreamCommandInput = {
        modelId: this.modelId,
        messages: this.convertMessages(params.messages),
      };

      if (params.systemPrompt) {
        input.system = [{ text: params.systemPrompt }];
      }

      if (params.tools && params.tools.length > 0) {
        input.toolConfig = {
          tools: this.convertTools(params.tools),
        };
      }

      const command = new ConverseStreamCommand(input);
      const response = await this.client.send(command);

      if (!response.stream) {
        yield {
          type: 'error',
          error: 'No stream received from Bedrock',
        };
        return;
      }

      for await (const event of response.stream) {
        if (event.contentBlockDelta?.delta?.text) {
          yield {
            type: 'text',
            content: event.contentBlockDelta.delta.text,
          };
        }

        if (event.contentBlockStart?.start?.toolUse) {
          const toolUse = event.contentBlockStart.start.toolUse;
          yield {
            type: 'tool_use',
            toolUse: {
              toolUseId: toolUse.toolUseId || '',
              name: toolUse.name || '',
              input: {},
            },
          };
        }

        if (event.messageStop) {
          yield {
            type: 'stop',
          };
        }
      }
    } catch (error: any) {
      // Handle specific AWS errors
      if (error.name === 'ThrottlingException' || error.name === 'TooManyRequestsException') {
        yield {
          type: 'error',
          error: 'Rate limit exceeded. Please wait a moment and try again.',
        };
      } else if (error.name === 'ValidationException') {
        yield {
          type: 'error',
          error: 'Invalid request. Please check your input and try again.',
        };
      } else {
        yield {
          type: 'error',
          error: `Failed to communicate with AI: ${error.message || 'Unknown error'}`,
        };
      }
    }
  }
}

// Singleton instance
let bedrockServiceInstance: BedrockService | null = null;

export function getBedrockService(): BedrockService {
  if (!bedrockServiceInstance) {
    bedrockServiceInstance = new BedrockService();
  }
  return bedrockServiceInstance;
}
