import { z } from 'zod';
import { createButtonResponseUI } from '../utils/ui-factory.js';

/**
 * Zod schema for button tool parameters
 * Validates action as string, source is optional
 */
export const ButtonSchema = z.object({
  action: z.string(),
  source: z.string().optional()
});

export type ButtonParams = z.infer<typeof ButtonSchema>;

/**
 * Button tool configuration for FastMCP
 */
export const buttonTool = {
  name: 'button',
  description: 'Handle button click events from UI components and return confirmation',
  parameters: ButtonSchema,
  execute: async (args: ButtonParams) => {
    try {
      // Validate parameters
      const validated = ButtonSchema.parse(args);
      
      const uiResource = createButtonResponseUI(validated.action, validated.source);
      
      return {
        content: [uiResource]
      };
    } catch (error) {
      console.error('Error in button tool:', error);
      throw error;
    }
  }
};
