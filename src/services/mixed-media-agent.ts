import { MixedMediaResult, MixedMediaResultSchema } from '../schemas/mixed-media.js';
import { ImageVariation, PLATFORM_DIMENSIONS } from '../schemas/ad-images.js';
import { AdCopyVariation } from '../schemas/ad-copy.js';

/**
 * Service for generating mixed media creatives (image + ad copy)
 * Combines selected image with ad copy text overlay
 */
export class MixedMediaAgent {
  /**
   * Generate a composite creative combining image and ad copy
   * 
   * @param image - Selected image variation
   * @param adCopy - Ad copy variation to overlay
   * @param platform - Target platform for formatting
   * @returns MixedMediaResult with composite image data
   */
  async generateComposite(
    image: ImageVariation,
    adCopy: AdCopyVariation,
    platform: string
  ): Promise<MixedMediaResult> {
    try {
      // Get platform-specific dimensions
      const dimensions = this.getPlatformDimensions(platform);
      
      // For now, we'll return the original image with metadata
      // In a full implementation, this would use a library like sharp or canvas
      // to overlay text on the image
      
      // Create the result
      const result: MixedMediaResult = {
        generated_at: new Date().toISOString(),
        composite_image_data: image.image_data,  // Using original image for now
        mime_type: image.mime_type,
        platform,
        dimensions,
        source_image_variation: image.variation_id,
        ad_copy_used: {
          headline: adCopy.headline,
          body_copy: adCopy.body_copy,
          cta: adCopy.cta
        }
      };
      
      // Validate against schema
      const validatedResult = MixedMediaResultSchema.parse(result);
      
      return validatedResult;
    } catch (error) {
      console.error('Error in generateComposite:', error);
      throw new Error(`Failed to generate mixed media creative: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get platform-specific dimensions
   */
  private getPlatformDimensions(platform: string): { width: number; height: number } {
    const platformKey = platform.toLowerCase().replace(/\s+/g, '_');
    const dimensions = PLATFORM_DIMENSIONS[platformKey as keyof typeof PLATFORM_DIMENSIONS];

    if (dimensions) {
      return dimensions;
    }

    // Default to Instagram feed dimensions (square)
    return { width: 1080, height: 1080 };
  }
}

/**
 * Singleton instance of the agent service
 */
export const mixedMediaAgent = new MixedMediaAgent();
