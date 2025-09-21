/**
 * Payment Method Ranking Algorithm Implementation
 * AfriConnect v3.0 - Payment Method Prioritization
 * 
 * score = 0.40·TrustFactor + 0.25·UserPreference + 0.20·SuccessRate + 0.15·CostEfficiency
 */

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'escrow' | 'wallet' | 'card' | 'paypal' | 'cash' | 'barter';
  transactionFee: number; // Percentage (0.0 - 1.0)
  available: boolean;
  requiresOnline: boolean;
}

export interface PaymentHistory {
  method_id: string;
  success_count: number;
  total_attempts: number;
  last_used: Date;
  user_preferred: boolean;
}

export interface UserPaymentProfile {
  user_id: string;
  payment_history: PaymentHistory[];
  preferred_method_id?: string;
  risk_tolerance: 'low' | 'medium' | 'high';
}

export interface RankingWeights {
  trustFactor: number;
  userPreference: number;
  successRate: number;
  costEfficiency: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  trustFactor: 0.40,
  userPreference: 0.25,
  successRate: 0.20,
  costEfficiency: 0.15
};

/**
 * Trust Factor mapping by payment method type
 */
const TRUST_FACTORS: Record<PaymentMethod['type'], number> = {
  escrow: 1.0,    // Highest trust - protected transactions
  wallet: 0.8,    // High trust - instant, secure
  card: 0.8,      // High trust - buyer protection
  paypal: 0.7,    // Medium-high trust - established platform
  cash: 0.5,      // Medium trust - face-to-face only
  barter: 0.4     // Lower trust - value assessment required
};

/**
 * Calculate Trust Factor score (0-1) based on payment method type
 */
function calculateTrustFactor(
  paymentMethod: PaymentMethod,
  userRiskTolerance: string
): number {
  let baseTrust = TRUST_FACTORS[paymentMethod.type];
  
  // Adjust for user risk tolerance
  switch (userRiskTolerance) {
    case 'low':
      // Conservative users prefer high-trust methods
      if (baseTrust >= 0.8) baseTrust = Math.min(1.0, baseTrust + 0.1);
      else baseTrust = Math.max(0.0, baseTrust - 0.1);
      break;
    case 'high':
      // Risk-tolerant users are more flexible
      baseTrust = Math.min(1.0, baseTrust + 0.05);
      break;
    case 'medium':
    default:
      // No adjustment for medium risk tolerance
      break;
  }
  
  return Math.max(0.0, Math.min(1.0, baseTrust));
}

/**
 * Calculate User Preference score (0-1) based on usage history
 */
function calculateUserPreference(
  paymentMethod: PaymentMethod,
  userProfile: UserPaymentProfile,
  currentTime: Date
): number {
  // Check if this is the explicitly preferred method
  if (userProfile.preferred_method_id === paymentMethod.id) {
    return 1.0;
  }
  
  // Find payment history for this method
  const history = userProfile.payment_history.find(
    h => h.method_id === paymentMethod.id
  );
  
  if (!history) {
    return 0.0; // Never used
  }
  
  // Check if used in last 3 months
  const threeMonthsAgo = new Date(currentTime);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  if (history.last_used >= threeMonthsAgo) {
    return 0.5; // Used recently
  }
  
  return 0.0; // Not used recently
}

/**
 * Calculate Success Rate score (0-1) from historical transaction data
 */
function calculateSuccessRate(
  paymentMethod: PaymentMethod,
  userProfile: UserPaymentProfile
): number {
  const history = userProfile.payment_history.find(
    h => h.method_id === paymentMethod.id
  );
  
  if (!history || history.total_attempts === 0) {
    // No history - use default success rates by type
    const defaultRates: Record<PaymentMethod['type'], number> = {
      escrow: 0.98,
      wallet: 0.95,
      card: 0.92,
      paypal: 0.90,
      cash: 0.85,
      barter: 0.70
    };
    return defaultRates[paymentMethod.type];
  }
  
  return history.success_count / history.total_attempts;
}

/**
 * Calculate Cost Efficiency score (0-1) based on transaction fees
 */
function calculateCostEfficiency(
  paymentMethod: PaymentMethod,
  orderAmount: number
): number {
  // Calculate effective fee rate
  const feeAmount = orderAmount * paymentMethod.transactionFee;
  
  // Score inversely related to fee percentage
  // 0% fee = 1.0 score, 5% fee = 0.0 score
  const maxFeeForScoring = 0.05; // 5%
  const score = Math.max(0.0, (maxFeeForScoring - paymentMethod.transactionFee) / maxFeeForScoring);
  
  return score;
}

/**
 * Calculate overall ranking score for a payment method
 */
export function calculatePaymentRankingScore(
  paymentMethod: PaymentMethod,
  userProfile: UserPaymentProfile,
  orderAmount: number,
  currentTime: Date,
  weights: RankingWeights = DEFAULT_WEIGHTS
): number {
  if (!paymentMethod.available) {
    return 0.0; // Unavailable methods get zero score
  }
  
  const trustFactor = calculateTrustFactor(paymentMethod, userProfile.risk_tolerance);
  const userPreference = calculateUserPreference(paymentMethod, userProfile, currentTime);
  const successRate = calculateSuccessRate(paymentMethod, userProfile);
  const costEfficiency = calculateCostEfficiency(paymentMethod, orderAmount);
  
  const score = 
    weights.trustFactor * trustFactor +
    weights.userPreference * userPreference +
    weights.successRate * successRate +
    weights.costEfficiency * costEfficiency;
  
  return Math.max(0, Math.min(1, score)); // Clamp to [0,1]
}

/**
 * Rank payment methods with deterministic tie-breakers
 */
export function rankPaymentMethods(
  paymentMethods: PaymentMethod[],
  userProfile: UserPaymentProfile,
  orderAmount: number,
  currentTime: Date = new Date(),
  weights?: RankingWeights
): Array<PaymentMethod & { score: number; details: any }> {
  const scoredMethods = paymentMethods
    .filter(method => method.available)
    .map(method => {
      const score = calculatePaymentRankingScore(
        method, 
        userProfile, 
        orderAmount, 
        currentTime, 
        weights
      );
      
      const details = {
        trustFactor: calculateTrustFactor(method, userProfile.risk_tolerance),
        userPreference: calculateUserPreference(method, userProfile, currentTime),
        successRate: calculateSuccessRate(method, userProfile),
        costEfficiency: calculateCostEfficiency(method, orderAmount)
      };
      
      return {
        ...method,
        score,
        details
      };
    });
  
  // Sort by score (descending), then by tie-breakers
  return scoredMethods.sort((a, b) => {
    // Primary: Higher score wins
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    
    // Tie-breaker 1: Higher Trust Factor
    if (a.details.trustFactor !== b.details.trustFactor) {
      return b.details.trustFactor - a.details.trustFactor;
    }
    
    // Tie-breaker 2: More recent transaction history
    const aHistory = userProfile.payment_history.find(h => h.method_id === a.id);
    const bHistory = userProfile.payment_history.find(h => h.method_id === b.id);
    
    if (aHistory && bHistory) {
      const aTime = aHistory.last_used.getTime();
      const bTime = bHistory.last_used.getTime();
      if (aTime !== bTime) {
        return bTime - aTime; // More recent wins
      }
    } else if (aHistory || bHistory) {
      return aHistory ? -1 : 1; // Method with history wins
    }
    
    // Tie-breaker 3: Alphabetical fallback (deterministic)
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get recommended payment method for a specific order
 */
export function getRecommendedPaymentMethod(
  paymentMethods: PaymentMethod[],
  userProfile: UserPaymentProfile,
  orderAmount: number,
  orderContext?: {
    seller_verified?: boolean;
    high_value?: boolean;
    international?: boolean;
  }
): PaymentMethod | null {
  let adjustedWeights = { ...DEFAULT_WEIGHTS };
  
  // Adjust weights based on order context
  if (orderContext?.high_value && orderAmount > 500) {
    // For high-value orders, prioritize trust and success rate
    adjustedWeights.trustFactor = 0.50;
    adjustedWeights.successRate = 0.25;
    adjustedWeights.userPreference = 0.15;
    adjustedWeights.costEfficiency = 0.10;
  }
  
  if (orderContext?.seller_verified === false) {
    // For unverified sellers, strongly prefer escrow
    adjustedWeights.trustFactor = 0.60;
    adjustedWeights.userPreference = 0.15;
    adjustedWeights.successRate = 0.15;
    adjustedWeights.costEfficiency = 0.10;
  }
  
  const rankedMethods = rankPaymentMethods(
    paymentMethods,
    userProfile,
    orderAmount,
    new Date(),
    adjustedWeights
  );
  
  return rankedMethods.length > 0 ? rankedMethods[0] : null;
}

/**
 * Test utilities for validation
 */
export const PaymentRankingTestUtils = {
  calculateTrustFactor,
  calculateUserPreference,
  calculateSuccessRate,
  calculateCostEfficiency,
  TRUST_FACTORS
};