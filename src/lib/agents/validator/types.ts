// Validator Agent Types - Comprehensive Validation System

// ============================================
// Web Search Types
// ============================================

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: "tavily" | "duckduckgo" | "bing" | "google" | "cached";
}

export interface SearchQuery {
    query: string;
    results: SearchResult[];
    timestamp: Date;
    cached: boolean;
}

// ============================================
// Market Analysis Types
// ============================================

export interface MarketSize {
    tam: string; // Total Addressable Market
    sam: string; // Serviceable Addressable Market
    som: string; // Serviceable Obtainable Market
    growthRate?: string;
    source?: string;
}

export interface MarketSegment {
    name: string;
    size: string;
    painPoints: string[];
    willingnessToPay: "low" | "medium" | "high";
}

export interface MarketTiming {
    score: number; // 1-100
    reasoning: string;
    factors: string[];
}

export interface MarketAnalysis {
    industry: string;
    marketSize: MarketSize;
    trends: string[];
    targetSegments: MarketSegment[];
    timing: MarketTiming;
    opportunities: string[];
    threats: string[];
    searchQueries: SearchQuery[];
}

// ============================================
// Competitor Analysis Types
// ============================================

export interface Competitor {
    name: string;
    website?: string;
    description: string;
    founded?: string;
    funding?: string;
    strengths: string[];
    weaknesses: string[];
    pricing?: string;
    marketShare?: string;
    targetAudience?: string;
}

export interface CompetitorAnalysis {
    directCompetitors: Competitor[];
    indirectCompetitors: Competitor[];
    alternativeSolutions: string[];
    marketGaps: string[];
    differentiationOpportunities: string[];
    competitiveAdvantageScore: number; // 1-100
    searchQueries: SearchQuery[];
}

// ============================================
// Risk Assessment Types
// ============================================

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskFactor {
    factor: string;
    level: RiskLevel;
    impact: string;
    likelihood: number; // 1-10
    mitigation: string;
}

export interface RiskDimension {
    name: string;
    score: number; // 1-100 (lower is better/less risky)
    level: RiskLevel;
    factors: RiskFactor[];
    overallMitigation: string;
}

export interface RiskAssessment {
    overallRiskScore: number; // 1-100
    overallRiskLevel: RiskLevel;
    dimensions: {
        market: RiskDimension;
        technical: RiskDimension;
        operational: RiskDimension;
        regulatory: RiskDimension;
        financial: RiskDimension;
    };
    topRisks: RiskFactor[];
    criticalBlockers: string[];
    searchQueries: SearchQuery[];
}

// ============================================
// Strategic Advice Types
// ============================================

export type Recommendation = "GO" | "NO_GO" | "CONDITIONAL";

export interface RefinedIdea {
    title: string;
    description: string;
    targetAudience: string;
    uniqueValueProposition: string;
    problemSolved: string;
    suggestedPivots?: string[];
}

export interface ValidationScores {
    marketPotential: number;
    feasibility: number;
    uniqueness: number;
    scalability: number;
    timing: number;
    overall: number;
}

export interface NextStep {
    priority: number;
    action: string;
    timeframe: string;
    resources?: string;
    successCriteria?: string;
}

export interface StrategicAdvice {
    recommendation: Recommendation;
    confidenceScore: number; // 1-100
    reasoning: string;

    refinedIdea: RefinedIdea;
    scores: ValidationScores;

    strengths: string[];
    weaknesses: string[];
    keyInsights: string[];

    nextSteps: NextStep[];
    criticalSuccess: string[];

    // If CONDITIONAL, what conditions?
    conditions?: string[];

    // Summary for quick view
    executiveSummary: string;
}

// ============================================
// Validator State (Shared across nodes)
// ============================================

export type ValidatorStage =
    | "initializing"
    | "market_analysis"
    | "competitor_analysis"
    | "risk_assessment"
    | "strategic_advice"
    | "complete"
    | "error";

export interface ValidatorState {
    // Input
    idea: {
        title: string;
        description: string;
    };

    // Progressive analysis results
    marketAnalysis?: MarketAnalysis;
    competitorAnalysis?: CompetitorAnalysis;
    riskAssessment?: RiskAssessment;
    strategicAdvice?: StrategicAdvice;

    // All search results for citation
    allSearchQueries: SearchQuery[];

    // Progress tracking
    currentStage: ValidatorStage;
    stageProgress: number; // 0-100 within current stage
    overallProgress: number; // 0-100 overall

    // Timing
    startTime: Date;
    stageTimings: Record<ValidatorStage, number>; // ms per stage

    // Errors
    errors: { stage: ValidatorStage; message: string; recoverable: boolean }[];
}

// ============================================
// Final Validation Output
// ============================================

export interface ValidationResult {
    success: boolean;

    // Core results
    recommendation: Recommendation;
    overallScore: number;
    validated: boolean; // true if GO or CONDITIONAL

    // Detailed analysis
    marketAnalysis: MarketAnalysis;
    competitorAnalysis: CompetitorAnalysis;
    riskAssessment: RiskAssessment;
    strategicAdvice: StrategicAdvice;

    // Refined idea
    refinedIdea: RefinedIdea;
    scores: ValidationScores;

    // Quick access
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextSteps: NextStep[];

    // Citations
    sources: SearchQuery[];

    // Meta
    processingTime: number; // ms
    timestamp: Date;
}
