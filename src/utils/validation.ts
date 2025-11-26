import { CampaignParameters } from '../types/campaign.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateBudget(budget: number, platform: string): boolean {
  // TODO: Implement budget validation logic
  const minimumBudgets: Record<string, number> = {
    'TikTok': 500,
    'Facebook': 100,
    'Instagram': 100,
    'Twitter': 200,
  };
  
  const minimum = minimumBudgets[platform] || 100;
  return budget >= minimum;
}

export function validatePlatformCompatibility(
  platform: string,
  demographics: string[]
): { compatible: boolean; suggestions?: string[] } {
  // TODO: Implement platform compatibility validation
  return { compatible: true };
}
