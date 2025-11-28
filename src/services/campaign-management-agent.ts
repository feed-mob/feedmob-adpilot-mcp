import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { query, type SDKMessage, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';
import { Campaign, getCampaignCompletionStatus, CampaignCompletionStatus } from '../schemas/campaign.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Campaign status with workflow guidance
 */
export interface CampaignStatus {
  campaign_id: string;
  campaign_name: string | null;
  status: 'in_progress' | 'complete';
  completion: CampaignCompletionStatus;
  next_step: string | null;
  next_step_description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Workflow step definitions
 */
const WORKFLOW_STEPS = {
  parseAdRequirements: {
    name: 'parseAdRequirements',
    description: 'Parse campaign requirements to extract structured parameters'
  },
  conductAdResearch: {
    name: 'conductAdResearch',
    description: 'Conduct comprehensive advertising research based on campaign parameters'
  },
  generateAdCopy: {
    name: 'generateAdCopy',
    description: 'Generate ad copy variations based on research insights'
  },
  generateAdImages: {
    name: 'generateAdImages',
    description: 'Generate image variations for the advertising campaign'
  },
  selectVariations: {
    name: 'selectVariations',
    description: 'Select preferred ad copy and image variations (A or B)'
  },
  generateMixedMedia: {
    name: 'generateMixedMedia',
    description: 'Create final mixed media creative combining selected image and copy'
  }
};

/**
 * Service for campaign management and workflow guidance
 */
export class CampaignManagementAgent {
  /**
   * Analyze campaign and determine status with next step guidance
   */
  analyzeCampaignStatus(campaign: Campaign): CampaignStatus {
    const completion = getCampaignCompletionStatus(campaign);
    const nextStep = this.determineNextStep(completion);
    
    return {
      campaign_id: campaign.id,
      campaign_name: campaign.parameters?.campaign_name || null,
      status: completion.isComplete ? 'complete' : 'in_progress',
      completion,
      next_step: nextStep?.name || null,
      next_step_description: nextStep?.description || null,
      created_at: campaign.created_at.toISOString(),
      updated_at: campaign.updated_at.toISOString()
    };
  }

  /**
   * Determine the next workflow step based on completion status
   */
  private determineNextStep(completion: CampaignCompletionStatus): { name: string; description: string } | null {
    if (!completion.hasParameters) {
      return WORKFLOW_STEPS.parseAdRequirements;
    }
    
    if (!completion.hasResearch) {
      return WORKFLOW_STEPS.conductAdResearch;
    }
    
    if (!completion.hasAdCopy) {
      return WORKFLOW_STEPS.generateAdCopy;
    }
    
    if (!completion.hasImages) {
      return WORKFLOW_STEPS.generateAdImages;
    }
    
    // Check if user needs to select variations before mixed media
    if (!completion.hasSelectedAdCopy || !completion.hasSelectedImage) {
      return WORKFLOW_STEPS.selectVariations;
    }
    
    if (!completion.hasMixedMedia) {
      return WORKFLOW_STEPS.generateMixedMedia;
    }
    
    // Campaign is complete
    return null;
  }

  /**
   * Get workflow guidance using the manage-campaign skill
   * 
   * @param campaign - Campaign data to analyze
   * @returns Detailed workflow guidance from the agent
   */
  async getWorkflowGuidance(campaign: Campaign): Promise<string> {
    try {
      const pluginPath = this.resolvePluginPath();
      const status = this.analyzeCampaignStatus(campaign);
      
      const prompt = `Use the "manage-campaign" skill to analyze this campaign and provide workflow guidance:

Campaign ID: ${campaign.id}
Campaign Name: ${campaign.parameters?.campaign_name || 'Unnamed'}
Status: ${status.status}

Completion:
- Parameters: ${status.completion.hasParameters ? '✅' : '❌'}
- Research: ${status.completion.hasResearch ? '✅' : '❌'}
- Ad Copy: ${status.completion.hasAdCopy ? '✅' : '❌'}
- Images: ${status.completion.hasImages ? '✅' : '❌'}
- Mixed Media: ${status.completion.hasMixedMedia ? '✅' : '❌'}
- Selected Ad Copy: ${status.completion.hasSelectedAdCopy ? '✅' : '❌'}
- Selected Image: ${status.completion.hasSelectedImage ? '✅' : '❌'}

Next Step: ${status.next_step || 'Complete'}

Provide guidance on what the user should do next.`;

      const assistantSnippets: string[] = [];
      let resultMessage: SDKResultMessage | undefined;

      for await (const message of query({
        prompt,
        options: {
          plugins: [{ type: 'local', path: pluginPath }],
          allowedTools: ['Skill', 'Read'],
          maxTurns: 10,
        }
      })) {
        if (message.type === 'assistant') {
          const text = this.extractAssistantText(message);
          if (text) {
            assistantSnippets.push(text);
          }
        } else if (message.type === 'result') {
          resultMessage = message;
        }
      }

      if (!resultMessage) {
        throw new Error('Claude Agent SDK returned no result message');
      }

      if (resultMessage.subtype !== 'success') {
        const reason = Array.isArray(resultMessage.errors) && resultMessage.errors.length
          ? resultMessage.errors.join('; ')
          : `subtype ${resultMessage.subtype}`;
        throw new Error(`Claude Agent run failed: ${reason}`);
      }

      return (resultMessage.result || assistantSnippets.join('\n')).trim();
    } catch (error) {
      console.error('Error in getWorkflowGuidance:', error);
      // Fall back to basic guidance
      const status = this.analyzeCampaignStatus(campaign);
      return `Campaign ${campaign.id} is ${status.status}. Next step: ${status.next_step_description || 'Campaign complete'}`;
    }
  }

  /**
   * Extract text content from assistant messages
   */
  private extractAssistantText(message: Extract<SDKMessage, { type: 'assistant' }>): string {
    const assistantMessage = message.message as any;
    const content = Array.isArray(assistantMessage?.content) ? assistantMessage.content : [];
    const textParts: string[] = [];

    for (const block of content) {
      if (typeof block === 'string') {
        textParts.push(block);
        continue;
      }

      if (block?.type === 'text' && typeof block.text === 'string') {
        textParts.push(block.text);
        continue;
      }

      if (block?.type === 'tool_result' && Array.isArray(block.content)) {
        for (const nested of block.content) {
          if (typeof nested === 'string') {
            textParts.push(nested);
          } else if (nested?.type === 'text' && typeof nested.text === 'string') {
            textParts.push(nested.text);
          }
        }
      }
    }

    return textParts.join('\n').trim();
  }

  /**
   * Resolve the path to the manage-campaign plugin
   */
  private resolvePluginPath(): string {
    const pluginPath = resolve(__dirname, '..', 'plugins', 'manage-campaign');
    
    if (existsSync(pluginPath)) {
      const manifestPath = resolve(pluginPath, 'skills', 'manage-campaign', 'SKILL.md');
      if (existsSync(manifestPath)) {
        console.log(`✅ Found manage-campaign plugin at: ${pluginPath}`);
        return pluginPath;
      }
    }

    throw new Error(
      `manage-campaign plugin not found at expected location: ${pluginPath}. Expected structure: src/plugins/manage-campaign/skills/manage-campaign/SKILL.md`
    );
  }
}

/**
 * Singleton instance of the campaign management agent
 */
export const campaignManagementAgent = new CampaignManagementAgent();
