import { z } from 'zod';

export const GenerateAdImagesSchema = z.object({
  campaignId: z.string().uuid().describe("Campaign ID for which to generate ad images")
});

export type GenerateAdImagesArgs = z.infer<typeof GenerateAdImagesSchema>;

// Tool implementation will be added in later tasks
