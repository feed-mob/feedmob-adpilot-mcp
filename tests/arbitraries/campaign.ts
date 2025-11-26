import fc from 'fast-check';
import { CampaignParameters } from '../../src/types/campaign.js';

export const budgetArbitrary = () => fc.record({
  amount: fc.integer({ min: 100, max: 1000000 }),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'JPY')
});

export const platformArbitrary = () => fc.record({
  name: fc.constantFrom('TikTok', 'Facebook', 'Instagram', 'Twitter'),
  format: fc.constantFrom('video', 'image', 'carousel', 'story')
});

export const campaignParametersArbitrary = () => fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  targetAudience: fc.record({
    demographics: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
    ageRange: fc.tuple(
      fc.integer({ min: 13, max: 65 }),
      fc.integer({ min: 13, max: 65 })
    ).map(([min, max]) => [Math.min(min, max), Math.max(min, max)] as [number, number])
  }),
  budget: budgetArbitrary(),
  platform: platformArbitrary(),
  kpis: fc.array(
    fc.constantFrom('CTR', 'installs', 'conversions', 'engagement'),
    { minLength: 1, maxLength: 4 }
  ),
  createdAt: fc.date(),
  updatedAt: fc.date()
});
