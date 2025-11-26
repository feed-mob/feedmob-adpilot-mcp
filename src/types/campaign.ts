export interface CampaignParameters {
  id?: string;
  userId: string;
  targetAudience: {
    demographics: string[];
    ageRange?: [number, number];
    location?: string[];
  };
  budget: {
    amount: number;
    currency: string;
  };
  platform: {
    name: string;
    format: string;
  };
  kpis: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Campaign extends CampaignParameters {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdCopy {
  id?: string;
  campaignId: string;
  headlines: string[];
  callsToAction: string[];
  bodyText: string[];
  variations: number;
  createdAt?: Date;
}

export interface ImageAsset {
  id?: string;
  campaignId: string;
  url: string;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  createdAt?: Date;
}

export interface MixedMediaAsset {
  id?: string;
  campaignId: string;
  imageUrl: string;
  overlayText: {
    headline: string;
    cta: string;
    position: string;
  };
  compositeUrl: string;
  createdAt?: Date;
}

export interface CreativeAsset {
  id: string;
  campaignId: string;
  assetType: 'copy' | 'image' | 'mixed_media';
  assetData: AdCopy | ImageAsset | MixedMediaAsset;
  createdAt: Date;
}
