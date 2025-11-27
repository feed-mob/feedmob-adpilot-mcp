import { z } from 'zod';
import { ConductAdResearchInputSchema } from '../schemas/ad-research.js';
import { adResearchAgent } from '../services/ad-research-agent.js';
import { createResearchReportUI, createResearchErrorUI } from '../utils/ad-research-ui.js';

/**
 * Conduct Ad Research tool configuration for FastMCP
 */
export const conductAdResearchTool = {
  name: 'conductAdResearch',
  description: 'Conduct comprehensive advertising research based on confirmed campaign parameters. Uses web search tools to gather insights on target audiences, platform trends, competitor strategies, industry benchmarks, and creative best practices. Returns a structured campaign report with actionable recommendations.',
  parameters: ConductAdResearchInputSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true
  },
  execute: async (args: z.infer<typeof ConductAdResearchInputSchema>) => {
    try {
      // Validate input
      const validated = ConductAdResearchInputSchema.parse(args);
      
      // Call agent service to conduct research
      const report = await adResearchAgent.conductResearch(validated.campaignParameters);
      
      // Generate UI for the result
      const uiResource = createResearchReportUI(report, validated.campaignParameters);
      
      // Create text summary for the LLM
      const textSummary = `Campaign Research Report Generated:

Campaign: ${report.campaign_name || 'Unnamed Campaign'}
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

The complete interactive report is displayed above with detailed insights for:
- Audience demographics and behaviors
- Platform-specific trends and best practices
- Creative direction and format recommendations
- Budget allocation across platforms
- Performance benchmarks and tracking recommendations
- Implementation timeline with activities

${report.assumptions.length > 0 ? `\nAssumptions Made:\n${report.assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : ''}`;
      
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
      console.error('Error in conductAdResearch tool:', error);
      
      // Determine error type
      let errorType: 'validation' | 'agent' | 'search' | 'timeout' | 'unknown' = 'unknown';
      
      if (error instanceof z.ZodError) {
        errorType = 'validation';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorType = 'timeout';
        } else if (error.message.includes('Failed to conduct research')) {
          errorType = 'agent';
        } else if (error.message.includes('search') || error.message.includes('Search')) {
          errorType = 'search';
        }
      }
      
      // Generate error UI
      const errorUI = createResearchErrorUI(
        error instanceof Error ? error : new Error('Unknown error occurred'),
        errorType
      );
      
      // Create text error message for the LLM
      const errorMessage = error instanceof Error 
        ? `Error conducting advertising research: ${error.message}`
        : 'An unknown error occurred while conducting advertising research';
      
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
