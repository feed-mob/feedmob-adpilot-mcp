import { z } from 'zod';

export const CampaignRequestSchema = z.object({
  requestText: z.string().describe("Natural language campaign request")
});

export type CampaignRequestArgs = z.infer<typeof CampaignRequestSchema>;

// Tool implementation will be added in later tasks
