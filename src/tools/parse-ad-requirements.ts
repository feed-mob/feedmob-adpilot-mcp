import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ParseAdRequirementsInputSchema, type CampaignParameters } from '../schemas/campaign-params.js';
import { adRequirementsAgent } from '../services/ad-requirements-agent.js';
import { campaignService } from '../services/campaign.js';
import { createParametersUI, createErrorUI } from '../utils/ad-requirements-ui.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

/**
 * Parse Ad Requirements tool configuration for FastMCP
 */
export const parseAdRequirementsTool = {
  name: 'parseAdRequirements',
  description: 'Parse natural language advertising campaign requirements into structured parameters. Extracts product, audience, budget, platform, KPIs, and other campaign details.',
  parameters: ParseAdRequirementsInputSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false
  },
  execute: async (args: z.infer<typeof ParseAdRequirementsInputSchema>) => {
    try {
      // Validate input
      const validated = ParseAdRequirementsInputSchema.parse(args);
      
      // Load existing campaign data if campaignId provided
      let existingParameters: CampaignParameters | null = null;
      let campaignId: string;
      let isUpdate = false;
      
      if (validated.campaignId) {
        campaignId = validated.campaignId;
        isUpdate = true;
        const campaign = await campaignService.getCampaign(campaignId);
        
        if (campaign) {
          existingParameters = campaign.parameters;
        } else {
          throw new CampaignNotFoundError(campaignId);
        }
      } else {
        campaignId = randomUUID();
      }
      
      // Call agent service to parse requirements
      const result = await adRequirementsAgent.parseRequirements(validated.requestText);
      
      // Merge with existing parameters if updating
      let finalParameters = result.parameters;
      if (existingParameters) {
        finalParameters = {
          product_or_service: result.parameters.product_or_service || existingParameters.product_or_service,
          product_or_service_url: result.parameters.product_or_service_url || existingParameters.product_or_service_url,
          campaign_name: result.parameters.campaign_name || existingParameters.campaign_name,
          target_audience: result.parameters.target_audience || existingParameters.target_audience,
          geography: result.parameters.geography || existingParameters.geography,
          ad_format: result.parameters.ad_format || existingParameters.ad_format,
          budget: result.parameters.budget || existingParameters.budget,
          platform: result.parameters.platform || existingParameters.platform,
          kpi: result.parameters.kpi || existingParameters.kpi,
          time_period: result.parameters.time_period || existingParameters.time_period,
          creative_direction: result.parameters.creative_direction || existingParameters.creative_direction,
          other_details: result.parameters.other_details || existingParameters.other_details
        };
      }
      
      // Save to database (create or update)
      if (isUpdate) {
        await campaignService.updateParameters(campaignId, finalParameters);
      } else {
        await campaignService.createCampaign(finalParameters, campaignId);
      }
      
      // Recalculate missing fields based on merged parameters
      const missingFields = Object.entries(finalParameters)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);
      
      const mergedResult = {
        success: missingFields.length === 0,
        parameters: finalParameters,
        missingFields,
        suggestions: result.suggestions
      };
      
      // Generate UI for the result with campaign ID
      const uiResource = createParametersUI(mergedResult, campaignId);
      
      // Create text summary for the LLM
      const { parameters } = mergedResult;
      const textSummary = `Parsed campaign requirements:

Campaign ID: ${campaignId}

Product/Service: ${parameters.product_or_service || 'Not specified'}
Product URL: ${parameters.product_or_service_url || 'Not specified'}
Campaign Name: ${parameters.campaign_name || 'Not specified'}
Target Audience: ${parameters.target_audience || 'Not specified'}
Geography: ${parameters.geography || 'Not specified'}
Ad Format: ${parameters.ad_format || 'Not specified'}
Budget: ${parameters.budget || 'Not specified'}
Platform: ${parameters.platform || 'Not specified'}
KPIs: ${parameters.kpi || 'Not specified'}
Time Period: ${parameters.time_period || 'Not specified'}
Creative Direction: ${parameters.creative_direction || 'Not specified'}
Other Details: ${parameters.other_details || 'Not specified'}

Missing Fields: ${result.missingFields.length > 0 ? result.missingFields.join(', ') : 'None'}
Status: ${result.success ? '✓ Complete' : '⚠ Incomplete'}`;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: textSummary
          },
          uiResource
        ]
      };
    } catch (error) {
      console.error('Error in parseAdRequirements tool:', error);
      
      // Determine error type
      let errorType: 'validation' | 'agent' | 'timeout' | 'not_found' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('Failed to parse requirements')) {
          errorType = 'agent';
        }
      }
      
      // Generate error UI
      const errorUI = createErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      // Create text error message for the LLM
      const errorMessage = error instanceof Error 
        ? `Error parsing campaign requirements: ${error.message}`
        : 'An unknown error occurred while parsing campaign requirements';
      
      return {
        content: [
          {
            type: 'text' as const,
            text: errorMessage
          },
          errorUI
        ]
      };
    }
  }
};
