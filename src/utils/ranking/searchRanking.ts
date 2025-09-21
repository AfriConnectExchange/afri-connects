/**
 * Search Ranking Algorithm Implementation
 * AfriConnect v3.0 - Discovery Algorithm Specification
 * 
 * score = 0.35·Proximity + 0.25·Recency + 0.15·Availability + 0.15·CategoryMatch + 0.10·Reputation − 0.10·StalenessPenalty
 */

export interface SearchItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  location: { lat: number; lng: number };
  listing_time: Date;
  created_at: Date;
  pickup_window: { start: string; end: string };
  seller_reputation: number; // 0.0 - 1.0 (completion rate)
  unanswered_requests: number;
  available: boolean;
}

export interface SearchQuery {
  keywords: string;
  category?: string;
  userLocation: { lat: number; lng: number };
  currentTime: Date;
}

export interface RankingWeights {
  proximity: number;
  recency: number;
  availability: number;
  categoryMatch: number;
  reputation: number;
  stalenessPenalty: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  proximity: 0.35,
  recency: 0.25,
  availability: 0.15,
  categoryMatch: 0.15,
  reputation: 0.10,
  stalenessPenalty: 0.10
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Proximity Score: Linear decay from 0–10 km (1.0 at 0 km → 0.0 at ≥10 km; clamp beyond 25 km)
 */
function calculateProximityScore(
  userLocation: { lat: number; lng: number },
  itemLocation: { lat: number; lng: number }
): number {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    itemLocation.lat,
    itemLocation.lng
  );
  
  // Clamp beyond 25 km
  if (distance >= 25) return 0.0;
  
  // Linear decay from 0-10 km
  if (distance >= 10) return 0.0;
  
  return Math.max(0, (10 - distance) / 10);
}

/**
 * Recency Score: Exponential decay with 24h half-life from listing_time
 */
function calculateRecencyScore(
  listingTime: Date,
  currentTime: Date
): number {
  const hoursElapsed = (currentTime.getTime() - listingTime.getTime()) / (1000 * 60 * 60);
  const halfLife = 24; // hours
  
  return Math.pow(0.5, hoursElapsed / halfLife);
}

/**
 * Availability Score: 1.0 if current time within pickup window; else 0.0
 */
function calculateAvailabilityScore(
  pickupWindow: { start: string; end: string },
  currentTime: Date,
  available: boolean
): number {
  if (!available) return 0.0;
  
  const currentHour = currentTime.getHours();
  const startHour = parseInt(pickupWindow.start.split(':')[0]);
  const endHour = parseInt(pickupWindow.end.split(':')[0]);
  
  // Handle overnight windows (e.g., 22:00 - 06:00)
  if (startHour > endHour) {
    return (currentHour >= startHour || currentHour <= endHour) ? 1.0 : 0.0;
  }
  
  return (currentHour >= startHour && currentHour <= endHour) ? 1.0 : 0.0;
}

/**
 * Category Match Score: 1.0 if query category/tag matches listing; 0.5 partial; 0.0 none
 */
function calculateCategoryMatchScore(
  queryCategory: string | undefined,
  queryKeywords: string,
  itemCategory: string,
  itemTags: string[]
): number {
  if (!queryCategory && !queryKeywords) return 0.0;
  
  const keywords = queryKeywords.toLowerCase().split(' ').filter(k => k.length > 0);
  const category = itemCategory.toLowerCase();
  const tags = itemTags.map(tag => tag.toLowerCase());
  
  // Exact category match
  if (queryCategory && queryCategory.toLowerCase() === category) {
    return 1.0;
  }
  
  // Check for keyword matches in category or tags
  let matchScore = 0.0;
  let totalChecks = 0;
  
  for (const keyword of keywords) {
    totalChecks++;
    
    // Exact match in category
    if (category.includes(keyword)) {
      matchScore += 1.0;
      continue;
    }
    
    // Exact match in tags
    if (tags.some(tag => tag.includes(keyword))) {
      matchScore += 1.0;
      continue;
    }
    
    // Partial match
    if (category.includes(keyword.substring(0, 3)) || 
        tags.some(tag => tag.includes(keyword.substring(0, 3)))) {
      matchScore += 0.5;
    }
  }
  
  return totalChecks > 0 ? Math.min(1.0, matchScore / totalChecks) : 0.0;
}

/**
 * Reputation Score: Normalized 0.0–1.0 from completion rate
 */
function calculateReputationScore(sellerReputation: number): number {
  return Math.max(0.0, Math.min(1.0, sellerReputation));
}

/**
 * Staleness Penalty: 0.2 if listing older than 72h or >3 unanswered requests; else 0.0
 */
function calculateStalenessPenalty(
  createdAt: Date,
  currentTime: Date,
  unansweredRequests: number
): number {
  const hoursOld = (currentTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  return (hoursOld > 72 || unansweredRequests > 3) ? 0.2 : 0.0;
}

/**
 * Calculate overall ranking score for a search item
 */
export function calculateRankingScore(
  item: SearchItem,
  query: SearchQuery,
  weights: RankingWeights = DEFAULT_WEIGHTS
): number {
  const proximityScore = calculateProximityScore(query.userLocation, item.location);
  const recencyScore = calculateRecencyScore(item.listing_time, query.currentTime);
  const availabilityScore = calculateAvailabilityScore(
    item.pickup_window, 
    query.currentTime, 
    item.available
  );
  const categoryMatchScore = calculateCategoryMatchScore(
    query.category,
    query.keywords,
    item.category,
    item.tags
  );
  const reputationScore = calculateReputationScore(item.seller_reputation);
  const stalenessPenalty = calculateStalenessPenalty(
    item.created_at,
    query.currentTime,
    item.unanswered_requests
  );
  
  const score = 
    weights.proximity * proximityScore +
    weights.recency * recencyScore +
    weights.availability * availabilityScore +
    weights.categoryMatch * categoryMatchScore +
    weights.reputation * reputationScore -
    weights.stalenessPenalty * stalenessPenalty;
  
  return Math.max(0, score); // Ensure non-negative score
}

/**
 * Sort search results by ranking score with deterministic tie-breakers
 */
export function rankSearchResults(
  items: SearchItem[],
  query: SearchQuery,
  weights?: RankingWeights
): Array<SearchItem & { score: number }> {
  const scoredItems = items.map(item => ({
    ...item,
    score: calculateRankingScore(item, query, weights)
  }));
  
  // Sort by score (descending), then by tie-breakers
  return scoredItems.sort((a, b) => {
    // Primary: Higher score wins
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    
    // Tie-breaker 1: Higher reputation wins
    if (a.seller_reputation !== b.seller_reputation) {
      return b.seller_reputation - a.seller_reputation;
    }
    
    // Tie-breaker 2: Newer created_at wins
    if (a.created_at.getTime() !== b.created_at.getTime()) {
      return b.created_at.getTime() - a.created_at.getTime();
    }
    
    // Tie-breaker 3: Ascending listing ID (deterministic)
    return a.id.localeCompare(b.id);
  });
}

/**
 * Test utilities for validation
 */
export const RankingTestUtils = {
  calculateProximityScore,
  calculateRecencyScore,
  calculateAvailabilityScore,
  calculateCategoryMatchScore,
  calculateReputationScore,
  calculateStalenessPenalty,
  calculateDistance
};