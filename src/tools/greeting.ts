import { z } from 'zod';
import { createGreetingUI } from '../utils/ui-factory.js';

/**
 * Zod schema for greeting tool parameters
 * Validates that name is a non-empty string with at least one non-whitespace character
 */
export const GreetingSchema = z.object({
  name: z.string().min(1, 'Name must be a non-empty string').refine(
    (val) => val.trim().length > 0,
    { message: 'Name must contain at least one non-whitespace character' }
  )
});

export type GreetingParams = z.infer<typeof GreetingSchema>;

/**
 * Greeting tool configuration for FastMCP
 */
export const greetingTool = {
  name: 'greet',
  description: 'Generate a personalized greeting with an interactive UI component',
  parameters: GreetingSchema,
  execute: async (args: GreetingParams) => {
    try {
      // Validate parameters
      const validated = GreetingSchema.parse(args);
      
      const uiResource = createGreetingUI(validated.name);
      
      return {
        content: [uiResource]
      };
    } catch (error) {
      console.error('Error in greeting tool:', error);
      throw error;
    }
  }
};
