import { z } from 'zod';
import { createCounterUI } from '../utils/ui-factory.js';

/**
 * Zod schema for counter tool parameters
 * Validates count as a number
 */
export const CounterSchema = z.object({
  count: z.number()
});

export type CounterParams = z.infer<typeof CounterSchema>;

/**
 * Counter tool configuration for FastMCP
 */
export const counterTool = {
  name: 'counter',
  description: 'Display an interactive counter with increment and decrement buttons',
  parameters: CounterSchema,
  execute: async (args: CounterParams) => {
    try {
      // Validate parameters
      const validated = CounterSchema.parse(args);
      
      const uiResource = createCounterUI(validated.count);
      
      return {
        content: [uiResource]
      };
    } catch (error) {
      console.error('Error in counter tool:', error);
      throw error;
    }
  }
};
