import { z } from 'zod';
import { ConductAdResearchInputSchema } from '../schemas/ad-research.js';
import type { CampaignParameters } from '../schemas/campaign-params.js';
import { adResearchAgent } from '../services/ad-research-agent.js';
import { createResearchReportUI, createResearchErrorUI } from '../utils/ad-research-ui.js';
import { campaignService } from '../services/campaign.js';
import { CampaignNotFoundError } from '../errors/campaign-errors.js';

/**
 * Conduct Ad Research tool configuration for FastMCP
 * 
 * Retrieves campaign parameters by ID or uses inline parameters,
 * conducts research, and stores the report in the database.
 */
export const conductAdResearchTool = {
  name: 'conductAdResearch',
  description: 'Conduct comprehensive advertising research based on campaign parameters. Accepts either a campaignId to retrieve stored parameters or inline campaignParameters. Uses web search to gather insights on audiences, platforms, competitors, and best practices. Stores the research report for use in subsequent tool calls.',
  parameters: ConductAdResearchInputSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true
  },
  execute: async (args: z.infer<typeof ConductAdResearchInputSchema>) => {
    try {
      // Validate input
      const validated = ConductAdResearchInputSchema.parse(args);
      
      let campaignId: string | undefined = validated.campaignId;
      let campaignParameters: CampaignParameters;
      
      // Get campaign parameters from database or use inline
      if (validated.campaignId) {
        const campaign = await campaignService.getCampaignOrThrow(validated.campaignId);
        
        // If inline params provided, use them and update the stored record
        if (validated.campaignParameters) {
          campaignParameters = validated.campaignParameters;
          await campaignService.updateParameters(validated.campaignId, campaignParameters);
        } else if (campaign.parameters) {
          campaignParameters = campaign.parameters;
        } else {
          throw new Error('Campaign has no parameters stored. Please provide campaignParameters.');
        }
      } else if (validated.campaignParameters) {
        campaignParameters = validated.campaignParameters;
      } else {
        throw new Error('Either campaignId or campaignParameters must be provided');
      }
      
      // Conduct research
      const report = await adResearchAgent.conductResearch(campaignParameters);

      
      // Store research report if we have a campaign ID
      if (campaignId) {
        try {
          await campaignService.updateResearch(campaignId, report);
        } catch (dbError) {
          console.error('Failed to store research report:', dbError);
          // Continue - we still have the report to return
        }
      }
      
      // Generate UI
      const uiResource = createResearchReportUI(report, campaignParameters, campaignId);
      
      // Create text summary
      const textSummary = `Campaign Research Report Generated:

${campaignId ? `Campaign ID: ${campaignId}\n` : ''}Campaign: ${report.campaign_name || 'Unnamed Campaign'}
Generated: ${new Date(report.generated_at).toLocaleString()}

Executive Summary:
${report.executive_summary.overview}

Key Findings:
${report.executive_summary.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Recommendations:
${report.executive_summary.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Platform Strategy: ${report.platform_strategy.length} platform(s) analyzed
Budget Allocation: ${report.budget_allocation.distribution.length} platform(s)
Performance Metrics: ${report.performance_metrics.primary_kpis.length} primary KPIs
Implementation Timeline: ${report.implementation_timeline.length} phase(s)
Sources: ${report.sources.length} source(s) cited

${campaignId ? 'Use this campaign ID in subsequent tool calls (generateAdCopy, generateAdImages, etc.)' : ''}
${report.assumptions.length > 0 ? `\nAssumptions Made:\n${report.assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : ''}`;
      
      return {
        content: [
          { type: 'text' as const, text: textSummary },
          uiResource
        ]
      };
    } catch (error) {
      console.error('Error in conductAdResearch tool:', error);
      
      let errorType: 'validation' | 'agent' | 'search' | 'timeout' | 'not_found' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof CampaignNotFoundError) {
        errorType = 'not_found';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('Failed to conduct research')) {
          errorType = 'agent';
        } else if (error.message.includes('search') || error.message.includes('Search')) {
          errorType = 'search';
        }
      }
      
      const errorUI = createResearchErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      const errorMessage = error instanceof Error 
        ? `Error conducting advertising research: ${error.message}`
        : 'An unknown error occurred while conducting advertising research';
      
      return {
        content: [
          { type: 'text' as const, text: errorMessage },
          errorUI
        ]
      };
    }
  }
};
