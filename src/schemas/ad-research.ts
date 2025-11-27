import { z } from 'zod';
import { CampaignParametersSchema } from './campaign-params.js';

/**
 * Schema for research source citations
 */
export const ResearchSourceSchema = z.object({
  title: z.string().min(1, 'Source title must not be empty'),
  url: z.string().url('Source URL must be valid'),
  accessed_at: z.string().datetime('Source access time must be ISO datetime')
});

export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

/**
 * Schema for executive summary section
 */
export const ExecutiveSummarySchema = z.object({
  overview: z.string().min(1, 'Overview must not be empty'),
  key_findings: z.array(z.string().min(1)).min(1, 'Must have at least one key finding'),
  recommendations: z.array(z.string().min(1)).min(1, 'Must have at least one recommendation')
});

export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;

/**
 * Schema for audience insights section
 */
export const AudienceInsightsSchema = z.object({
  demographics: z.string().min(1, 'Demographics must not be empty'),
  behaviors: z.string().min(1, 'Behaviors must not be empty'),
  preferences: z.string().min(1, 'Preferences must not be empty'),
  engagement_patterns: z.string().min(1, 'Engagement patterns must not be empty')
});

export type AudienceInsights = z.infer<typeof AudienceInsightsSchema>;

/**
 * Schema for platform strategy item
 */
export const PlatformStrategyItemSchema = z.object({
  platform: z.string().min(1, 'Platform name must not be empty'),
  trends: z.string().min(1, 'Trends must not be empty'),
  best_practices: z.string().min(1, 'Best practices must not be empty'),
  optimization_tips: z.string().min(1, 'Optimization tips must not be empty')
});

export type PlatformStrategyItem = z.infer<typeof PlatformStrategyItemSchema>;

/**
 * Schema for platform strategy section (array of platform items)
 */
export const PlatformStrategySchema = z.array(PlatformStrategyItemSchema).min(1, 'Must have at least one platform strategy');

export type PlatformStrategy = z.infer<typeof PlatformStrategySchema>;

/**
 * Schema for creative direction section
 */
export const CreativeDirectionSchema = z.object({
  content_types: z.array(z.string().min(1)).min(1, 'Must have at least one content type'),
  format_recommendations: z.string().min(1, 'Format recommendations must not be empty'),
  tone_and_style: z.string().min(1, 'Tone and style must not be empty'),
  examples: z.array(z.string().min(1)).min(1, 'Must have at least one example')
});

export type CreativeDirection = z.infer<typeof CreativeDirectionSchema>;

/**
 * Schema for budget distribution item
 */
export const BudgetDistributionItemSchema = z.object({
  platform: z.string().min(1, 'Platform name must not be empty'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  rationale: z.string().min(1, 'Rationale must not be empty')
});

export type BudgetDistributionItem = z.infer<typeof BudgetDistributionItemSchema>;

/**
 * Schema for budget allocation section
 */
export const BudgetAllocationSchema = z.object({
  total_budget: z.string().nullable(),
  distribution: z.array(BudgetDistributionItemSchema).min(1, 'Must have at least one distribution item'),
  optimization_suggestions: z.string().min(1, 'Optimization suggestions must not be empty')
});

export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;

/**
 * Schema for performance benchmark item
 */
export const PerformanceBenchmarkSchema = z.object({
  metric: z.string().min(1, 'Metric name must not be empty'),
  industry_average: z.string().min(1, 'Industry average must not be empty'),
  target: z.string().min(1, 'Target must not be empty')
});

export type PerformanceBenchmark = z.infer<typeof PerformanceBenchmarkSchema>;

/**
 * Schema for performance metrics section
 */
export const PerformanceMetricsSchema = z.object({
  primary_kpis: z.array(z.string().min(1)).min(1, 'Must have at least one primary KPI'),
  benchmarks: z.array(PerformanceBenchmarkSchema).min(1, 'Must have at least one benchmark'),
  tracking_recommendations: z.string().min(1, 'Tracking recommendations must not be empty')
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

/**
 * Schema for implementation timeline phase
 */
export const ImplementationPhaseSchema = z.object({
  phase: z.string().min(1, 'Phase name must not be empty'),
  duration: z.string().min(1, 'Duration must not be empty'),
  activities: z.array(z.string().min(1)).min(1, 'Must have at least one activity')
});

export type ImplementationPhase = z.infer<typeof ImplementationPhaseSchema>;

/**
 * Schema for implementation timeline section (array of phases)
 */
export const ImplementationTimelineSchema = z.array(ImplementationPhaseSchema).min(1, 'Must have at least one phase');

export type ImplementationTimeline = z.infer<typeof ImplementationTimelineSchema>;

/**
 * Schema for complete campaign report
 */
export const CampaignReportSchema = z.object({
  // Metadata
  generated_at: z.string().datetime('Generated timestamp must be ISO datetime'),
  campaign_name: z.string().nullable(),
  
  // Report sections
  executive_summary: ExecutiveSummarySchema,
  audience_insights: AudienceInsightsSchema,
  platform_strategy: PlatformStrategySchema,
  creative_direction: CreativeDirectionSchema,
  budget_allocation: BudgetAllocationSchema,
  performance_metrics: PerformanceMetricsSchema,
  implementation_timeline: ImplementationTimelineSchema,
  
  // Sources and compliance
  sources: z.array(ResearchSourceSchema).min(1, 'Must have at least one source'),
  assumptions: z.array(z.string()),
  disclaimer: z.string().min(1, 'Disclaimer must not be empty')
});

export type CampaignReport = z.infer<typeof CampaignReportSchema>;

/**
 * Schema for conduct ad research tool input
 * Validates that campaign parameters are provided
 */
export const ConductAdResearchInputSchema = z.object({
  campaignParameters: CampaignParametersSchema
});

export type ConductAdResearchInput = z.infer<typeof ConductAdResearchInputSchema>;
