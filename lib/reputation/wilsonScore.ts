/**
 * Wilson Score Implementation for Trust-Weighted Crowdsourcing
 * Calculates confidence intervals for binary ratings to filter noisy/malicious reports
 * Reference: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
 */

/**
 * Calculate Wilson Score Confidence Interval
 * @param positive Number of positive ratings
 * @param total Total number of ratings
 * @returns Wilson score (0-1) representing confidence in the rating
 */
export function calculateWilsonScore(positive: number, total: number): number {
  if (total === 0) return 0;
  
  // 95% confidence interval z-score
  const z = 1.96;
  const p = positive / total;
  
  // Wilson score formula
  const numerator = p + (z * z) / (2 * total) - 
    z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  const denominator = 1 + (z * z) / total;
  
  return Math.max(0, Math.min(1, numerator / denominator));
}

/**
 * Calculate Wilson Score with different confidence levels
 * @param positive Number of positive ratings
 * @param total Total number of ratings
 * @param confidenceLevel Confidence level (0.9, 0.95, 0.99)
 * @returns Wilson score (0-1) representing confidence in the rating
 */
export function calculateWilsonScoreWithConfidence(
  positive: number, 
  total: number, 
  confidenceLevel: number = 0.95
): number {
  if (total === 0) return 0;
  
  // Z-scores for different confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  const z = zScores[confidenceLevel] || 1.96;
  const p = positive / total;
  
  // Wilson score formula
  const numerator = p + (z * z) / (2 * total) - 
    z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  const denominator = 1 + (z * z) / total;
  
  return Math.max(0, Math.min(1, numerator / denominator));
}

/**
 * Calculate Wilson Score for multi-category ratings
 * @param ratings Object with category counts { positive: number, neutral: number, negative: number }
 * @param total Total number of ratings
 * @returns Wilson scores for each category
 */
export function calculateMultiCategoryWilsonScore(
  ratings: { positive: number; neutral: number; negative: number },
  total: number
): { positive: number; neutral: number; negative: number } {
  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }
  
  return {
    positive: calculateWilsonScore(ratings.positive, total),
    neutral: calculateWilsonScore(ratings.neutral, total),
    negative: calculateWilsonScore(ratings.negative, total)
  };
}

/**
 * Calculate reputation score based on report history
 * @param reportsSubmitted Total reports submitted by user
 * @param reportsVerified Verified reports (positive feedback)
 * @returns Reputation score (0-1) with Wilson confidence interval
 */
export function calculateUserReputation(
  reportsSubmitted: number, 
  reportsVerified: number
): number {
  return calculateWilsonScore(reportsVerified, reportsSubmitted);
}

/**
 * Determine community standing based on reputation score
 * @param reputationScore Wilson score (0-1)
 * @param totalReports Total reports submitted
 * @returns Community standing level
 */
export function determineCommunityStanding(
  reputationScore: number, 
  totalReports: number
): 'new' | 'trusted' | 'verified' | 'expert' {
  if (totalReports < 10) return 'new';
  if (reputationScore > 0.8 && totalReports > 50) return 'expert';
  if (reputationScore > 0.6 && totalReports > 20) return 'verified';
  if (reputationScore > 0.4) return 'trusted';
  return 'new';
}

/**
 * Weight report trustworthiness based on reporter's reputation
 * @param reporterReputation Wilson score of reporter (0-1)
 * @param reportVerificationCount Cross-reports confirming this issue
 * @returns Weighted trust score for the report (0-1)
 */
export function calculateReportTrust(
  reporterReputation: number, 
  reportVerificationCount: number
): number {
  // Base trust from reporter reputation
  const baseTrust = reporterReputation;
  
  // Bonus for community verification
  const verificationBonus = Math.min(0.3, reportVerificationCount * 0.05);
  
  // Cap at 1.0
  return Math.min(1.0, baseTrust + verificationBonus);
}

/**
 * Filter reports based on trust thresholds
 * @param reports Array of reports with trust scores
 * @param minTrustThreshold Minimum trust score to accept (0-1)
 * @returns Filtered array of trusted reports
 */
export function filterTrustedReports<T extends { trustScore: number }>(
  reports: T[], 
  minTrustThreshold: number = 0.5
): T[] {
  return reports.filter(report => report.trustScore >= minTrustThreshold);
}

/**
 * Aggregate multiple reports at the same location
 * @param reports Reports at the same location
 * @returns Aggregated trust score and consolidated report
 */
export function aggregateLocationReports<T extends { trustScore: number; severity: number }>(
  reports: T[]
): { aggregatedTrust: number; averageSeverity: number; reportCount: number } {
  if (reports.length === 0) {
    return { aggregatedTrust: 0, averageSeverity: 0, reportCount: 0 };
  }
  
  // Weighted average of trust scores
  const totalWeight = reports.reduce((sum, r) => sum + r.trustScore, 0);
  const weightedTrust = reports.reduce((sum, r) => sum + r.trustScore * r.trustScore, 0) / 
    (totalWeight || 1);
  
  // Average severity weighted by trust
  const weightedSeverity = reports.reduce((sum, r) => sum + r.severity * r.trustScore, 0) / 
    (totalWeight || 1);
  
  return {
    aggregatedTrust: weightedTrust,
    averageSeverity: weightedSeverity,
    reportCount: reports.length
  };
}

export default {
  calculateWilsonScore,
  calculateUserReputation,
  determineCommunityStanding,
  calculateReportTrust,
  filterTrustedReports,
  aggregateLocationReports
};