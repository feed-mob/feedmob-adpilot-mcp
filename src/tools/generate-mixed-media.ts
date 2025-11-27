import { z } from 'zod';
import { GenerateMixedMediaInputSchema } from '../schemas/mixed-media.js';
import { mixedMediaAgent } from '../services/mixed-media-agent.js';
import { createMixedMediaUI, createMixedMediaErrorUI } from '../utils/mixed-media-ui.js';

/**
 * MCP tool for generating mixed media creatives (image + ad copy)
 * 
 * Combines a selected image with ad copy to create a complete,
 * platform-ready advertising creative.
 */
export const generateMixedMediaCreativeTool = {
  name: 'generateMixedMediaCreative',
  description: 'Generate a mixed media creative by combining a selected image with ad copy. Creates a composite with text overlay formatted for the target platform. Returns interactive UI with preview and export options.',
  parameters: GenerateMixedMediaInputSchema,
  execute: async (args: z.infer<typeof GenerateMixedMediaInputSchema>) => {
    try {
      // Validate input
      const validated = GenerateMixedMediaInputSchema.parse(args);
      
      // Call agent service to generate composite
      const result = await mixedMediaAgent.generateComposite(
        validated.selectedImage,
        validated.adCopy,
        validated.platform
      );
      
      // Generate UI
      const uiResource = createMixedMediaUI(result);
      
      // Create text summary for LLM
      const textSummary = `Generated mixed media creative:

**Composite Image URL**: ${result.composite_image_url}
**Platform**: ${result.platform}
**Dimensions**: ${result.dimensions.width}×${result.dimensions.height}
**Source Image**: Variation ${result.source_image_variation}

**Ad Copy**:
- Headline: ${result.ad_copy_used.headline}
- Body: ${result.ad_copy_used.body_copy}
- CTA: ${result.ad_copy_used.cta}

The creative is now ready for download and use in your ${result.platform} campaign. You can download it as PNG or JPEG, or try different copy or image variations.`;
      
      // Return both text and UI
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      // Categorize error type
      let errorType: 'validation' | 'generation' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('generate') || error.message.includes('composite')) {
          errorType = 'generation';
        }
      }
      
      // Generate error UI
      const errorUI = createMixedMediaErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          { type: 'text' as const, text: `Error generating mixed media creative: ${errorMessage}` },
          errorUI
        ]
      };
    }
  }
};
