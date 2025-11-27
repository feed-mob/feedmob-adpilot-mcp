import { z } from 'zod';
import { GenerateAdImagesInputSchema } from '../schemas/ad-images.js';
import { adImagesAgent } from '../services/ad-images-agent.js';
import { createAdImagesUI, createAdImagesErrorUI } from '../utils/ad-images-ui.js';

/**
 * MCP tool for generating ad image variations
 * 
 * Generates two distinct image variations using Google Gemini API
 * based on campaign parameters and optional research insights.
 */
export const generateAdImagesTool = {
  name: 'generateAdImages',
  description: 'Generate two distinct AI-powered image variations for advertising campaigns using Google Gemini. Creates platform-optimized visuals based on campaign parameters and research insights. Returns interactive UI for comparing and selecting variations.',
  parameters: GenerateAdImagesInputSchema,
  execute: async (args: z.infer<typeof GenerateAdImagesInputSchema>) => {
    try {
      // Validate input
      const validated = GenerateAdImagesInputSchema.parse(args);
      
      // Call agent service to generate images
      const result = await adImagesAgent.generateImages(
        validated.campaignParameters,
        validated.campaignReport
      );
      
      // Generate UI
      const uiResource = createAdImagesUI(result);
      
      // Create text summary for LLM
      const textSummary = `Generated two ad image variations:

**Variation A** (${result.recommended_variation === 'A' ? '⭐ Recommended' : ''}):
- Visual Approach: ${result.variations[0].visual_approach}
- Dimensions: ${result.variations[0].dimensions.width}×${result.variations[0].dimensions.height}

**Variation B** (${result.recommended_variation === 'B' ? '⭐ Recommended' : ''}):
- Visual Approach: ${result.variations[1].visual_approach}
- Dimensions: ${result.variations[1].dimensions.width}×${result.variations[1].dimensions.height}

**Recommendation**: ${result.recommendation_rationale}

The user can now select their preferred variation to proceed with mixed media creative generation.`;
      
      // Return both text and UI
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      // Categorize error type
      let errorType: 'validation' | 'api' | 'timeout' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('took too long')) {
          errorType = 'timeout';
        } else if (
          error.message.includes('Gemini') ||
          error.message.includes('API') ||
          error.message.includes('generate')
        ) {
          errorType = 'api';
        }
      }
      
      // Generate error UI
      const errorUI = createAdImagesErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          { type: 'text' as const, text: `Error generating ad images: ${errorMessage}` },
          errorUI
        ]
      };
    }
  }
};
