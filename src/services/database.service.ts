import { Pool } from 'pg';
import { User } from '../types/user.js';
import { CampaignParameters, Campaign, CreativeAsset } from '../types/campaign.js';

export class DatabaseService {
  constructor(private pool: Pool) {}

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO users (email, name, picture, google_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [user.email, user.name, user.picture, user.googleId]
    );
    return result.rows[0].id;
  }

  async getUser(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      googleId: row.google_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      googleId: row.google_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      googleId: row.google_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Campaign operations
  async saveCampaign(
    userId: string,
    params: Omit<CampaignParameters, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO campaigns (user_id, target_audience, budget, platform, kpis) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        userId,
        JSON.stringify(params.targetAudience),
        JSON.stringify(params.budget),
        JSON.stringify(params.platform),
        params.kpis
      ]
    );
    return result.rows[0].id;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    const result = await this.pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [campaignId]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      targetAudience: row.target_audience,
      budget: row.budget,
      platform: row.platform,
      kpis: row.kpis,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getCampaignHistory(userId: string, limit = 50): Promise<Campaign[]> {
    const result = await this.pool.query(
      `SELECT * FROM campaigns 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      targetAudience: row.target_audience,
      budget: row.budget,
      platform: row.platform,
      kpis: row.kpis,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // Creative asset operations
  async saveCreativeAsset(
    campaignId: string,
    assetType: 'copy' | 'image' | 'mixed_media',
    assetData: any
  ): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO creative_assets (campaign_id, asset_type, asset_data) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [campaignId, assetType, JSON.stringify(assetData)]
    );
    return result.rows[0].id;
  }

  async getCreativeAssets(campaignId: string): Promise<CreativeAsset[]> {
    const result = await this.pool.query(
      `SELECT * FROM creative_assets 
       WHERE campaign_id = $1 
       ORDER BY created_at DESC`,
      [campaignId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      assetType: row.asset_type,
      assetData: row.asset_data,
      createdAt: row.created_at
    }));
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cleanup
  async close(): Promise<void> {
    await this.pool.end();
  }
}
