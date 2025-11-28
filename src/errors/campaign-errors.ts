/**
 * Error thrown when a campaign is not found by ID
 */
export class CampaignNotFoundError extends Error {
  public readonly campaignId: string;

  constructor(campaignId: string) {
    super(`Campaign not found: ${campaignId}`);
    this.name = 'CampaignNotFoundError';
    this.campaignId = campaignId;
  }
}

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(`Database connection failed: ${message}`);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Error thrown when required campaign assets are missing
 */
export class MissingAssetsError extends Error {
  public readonly campaignId: string;
  public readonly missingAssets: string[];

  constructor(campaignId: string, missingAssets: string[]) {
    super(`Campaign ${campaignId} is missing required assets: ${missingAssets.join(', ')}`);
    this.name = 'MissingAssetsError';
    this.campaignId = campaignId;
    this.missingAssets = missingAssets;
  }
}

/**
 * Error thrown when campaign data validation fails
 */
export class CampaignValidationError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`Campaign validation failed for ${field}: ${message}`);
    this.name = 'CampaignValidationError';
    this.field = field;
  }
}
