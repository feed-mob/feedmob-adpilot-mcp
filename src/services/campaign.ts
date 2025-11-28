import { db } from './database.js';
import { CampaignSchema, type Campaign } from '../schemas/campaign.js';
import type { CampaignParameters } from '../schemas/campaign-params.js';
import type { CampaignReport } from '../schemas/ad-research.js';
import type { AdCopyResult } from '../schemas/ad-copy.js';
import type { AdImagesResult } from '../schemas/ad-images.js';
import type { MixedMediaResult } from '../schemas/mixed-media.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

/**
 * CampaignService - Business logic for campaign CRUD operations
 */
class CampaignService {
  /**
   * Create a new campaign with initial parameters
   */
  async createCampaign(parameters: CampaignParameters): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `INSERT INTO campaigns (parameters, parameters_updated_at)
       VALUES ($1, NOW())
       RETURNING *`,
      [JSON.stringify(parameters)]
    );

    if (rows.length === 0) {
      throw new Error('Failed to create campaign');
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Get a campaign by ID, returns null if not found
   */
  async getCampaign(id: string): Promise<Campaign | null> {
    const row = await db.queryOne<Campaign>(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );

    if (!row) {
      return null;
    }

    return this.parseCampaignRow(row);
  }

  /**
   * Get a campaign by ID, throws if not found
   */
  async getCampaignOrThrow(id: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id);
    
    if (!campaign) {
      throw new CampaignNotFoundError(id);
    }

    return campaign;
  }


  /**
   * Update campaign parameters
   */
  async updateParameters(id: string, parameters: CampaignParameters): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET parameters = $2, parameters_updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(parameters)]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Update campaign research report
   */
  async updateResearch(id: string, report: CampaignReport): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET research = $2, research_updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(report)]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Update campaign ad copy
   */
  async updateAdCopy(id: string, result: AdCopyResult): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET ad_copy = $2, ad_copy_updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(result)]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Update campaign images
   */
  async updateImages(id: string, result: AdImagesResult): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET images = $2, images_updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(result)]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Update campaign mixed media
   */
  async updateMixedMedia(id: string, result: MixedMediaResult): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET mixed_media = $2, mixed_media_updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, JSON.stringify(result)]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }


  /**
   * Select ad copy variation
   */
  async selectAdCopyVariation(id: string, variation: 'A' | 'B'): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET selected_ad_copy_variation = $2
       WHERE id = $1
       RETURNING *`,
      [id, variation]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Select image variation
   */
  async selectImageVariation(id: string, variation: 'A' | 'B'): Promise<Campaign> {
    const rows = await db.query<Campaign>(
      `UPDATE campaigns 
       SET selected_image_variation = $2
       WHERE id = $1
       RETURNING *`,
      [id, variation]
    );

    if (rows.length === 0) {
      throw new CampaignNotFoundError(id);
    }

    return this.parseCampaignRow(rows[0]);
  }

  /**
   * Parse and validate a campaign row from the database
   */
  private parseCampaignRow(row: Record<string, unknown>): Campaign {
    // Parse the row through the schema for validation
    return CampaignSchema.parse(row);
  }
}

// Singleton export
export const campaignService = new CampaignService();
