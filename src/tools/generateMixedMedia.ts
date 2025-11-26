import { z } from 'zod';

export const GenerateMixedMediaSchema = z.object({
  campaignId: z.string().uuid().describe("Campaign ID for which to generate mixed media assets")
});

export type GenerateMixedMediaArgs = z.infer<typeof GenerateMixedMediaSchema>;

// Tool implementation will be added in later tasks
