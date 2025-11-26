import { createUIResource } from '@mcp-ui/server';
import { CampaignParameters, AdCopy, ImageAsset, MixedMediaAsset, Campaign } from '../types/campaign.js';

export class UIResourceGenerator {
  createParameterDisplay(params: CampaignParameters) {
    // TODO: Implement parameter display UIResource
    throw new Error('Not implemented');
  }

  createCopyDisplay(copy: AdCopy) {
    // TODO: Implement copy display UIResource
    throw new Error('Not implemented');
  }

  createImageDisplay(images: ImageAsset[]) {
    // TODO: Implement image display UIResource
    throw new Error('Not implemented');
  }

  createMixedMediaDisplay(asset: MixedMediaAsset) {
    // TODO: Implement mixed media display UIResource
    throw new Error('Not implemented');
  }

  createHistoryDisplay(campaigns: Campaign[]) {
    // TODO: Implement history display UIResource
    throw new Error('Not implemented');
  }
}
