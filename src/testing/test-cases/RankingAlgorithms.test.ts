/**
 * Test Cases for Ranking Algorithms
 * AfriConnect v3.0 - Comprehensive Algorithm Validation
 */

import { 
  calculateRankingScore, 
  rankSearchResults, 
  RankingTestUtils,
  SearchItem,
  SearchQuery 
} from '../../utils/ranking/searchRanking';

import {
  calculatePaymentRankingScore,
  rankPaymentMethods,
  PaymentRankingTestUtils,
  PaymentMethod,
  UserPaymentProfile
} from '../../utils/ranking/paymentRanking';

// Test data setup
const mockSearchItems: SearchItem[] = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    category: 'Electronics',
    tags: ['phone', 'apple', 'smartphone'],
    location: { lat: 51.5074, lng: -0.1278 }, // London center
    listing_time: new Date('2024-01-15T10:00:00Z'),
    created_at: new Date('2024-01-15T10:00:00Z'),
    pickup_window: { start: '09:00', end: '17:00' },
    seller_reputation: 0.95,
    unanswered_requests: 1,
    available: true
  },
  {
    id: '2', 
    name: 'Samsung Galaxy S23',
    category: 'Electronics',
    tags: ['phone', 'samsung', 'android'],
    location: { lat: 51.5174, lng: -0.1378 }, // 1.5km from center
    listing_time: new Date('2024-01-14T15:00:00Z'), // 19 hours ago
    created_at: new Date('2024-01-12T10:00:00Z'), // 3 days ago
    pickup_window: { start: '10:00', end: '16:00' },
    seller_reputation: 0.88,
    unanswered_requests: 4, // Should trigger staleness penalty
    available: true
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'escrow_1',
    name: 'Escrow Payment',
    type: 'escrow',
    transactionFee: 0.02,
    available: true,
    requiresOnline: true
  },
  {
    id: 'card_1',
    name: 'Credit/Debit Card',
    type: 'card', 
    transactionFee: 0.029,
    available: true,
    requiresOnline: true
  },
  {
    id: 'cash_1',
    name: 'Cash on Delivery',
    type: 'cash',
    transactionFee: 0.0,
    available: true,
    requiresOnline: false
  }
];

const mockUserProfile: UserPaymentProfile = {
  user_id: 'user_123',
  preferred_method_id: 'escrow_1',
  risk_tolerance: 'medium',
  payment_history: [
    {
      method_id: 'escrow_1',
      success_count: 48,
      total_attempts: 50,
      last_used: new Date('2024-01-10T12:00:00Z'),
      user_preferred: true
    },
    {
      method_id: 'card_1',
      success_count: 19,
      total_attempts: 20,
      last_used: new Date('2023-12-15T14:30:00Z'),
      user_preferred: false
    }
  ]
};

describe('Search Ranking Algorithm Tests', () => {
  
  describe('Proximity Scoring', () => {
    test('should return 1.0 for 0km distance', () => {
      const userLocation = { lat: 51.5074, lng: -0.1278 };
      const itemLocation = { lat: 51.5074, lng: -0.1278 };
      
      const score = RankingTestUtils.calculateProximityScore(userLocation, itemLocation);
      expect(score).toBe(1.0);
    });
    
    test('should return 0.5 for 5km distance', () => {
      const userLocation = { lat: 51.5074, lng: -0.1278 };
      const itemLocation = { lat: 51.5524, lng: -0.1278 }; // ~5km north
      
      const score = RankingTestUtils.calculateProximityScore(userLocation, itemLocation);
      expect(score).toBeCloseTo(0.5, 1);
    });
    
    test('should return 0.0 for 10km+ distance', () => {
      const userLocation = { lat: 51.5074, lng: -0.1278 };
      const itemLocation = { lat: 51.5974, lng: -0.1278 }; // ~10km north
      
      const score = RankingTestUtils.calculateProximityScore(userLocation, itemLocation);
      expect(score).toBe(0.0);
    });
    
    test('should clamp distances beyond 25km to 0.0', () => {
      const userLocation = { lat: 51.5074, lng: -0.1278 }; // London
      const itemLocation = { lat: 52.2053, lng: 0.1218 }; // Cambridge (~80km)
      
      const score = RankingTestUtils.calculateProximityScore(userLocation, itemLocation);
      expect(score).toBe(0.0);
    });
  });
  
  describe('Recency Scoring', () => {
    test('should return 1.0 for current time', () => {
      const currentTime = new Date('2024-01-15T10:00:00Z');
      const listingTime = new Date('2024-01-15T10:00:00Z');
      
      const score = RankingTestUtils.calculateRecencyScore(listingTime, currentTime);
      expect(score).toBe(1.0);
    });
    
    test('should return 0.5 for 24h half-life', () => {
      const currentTime = new Date('2024-01-16T10:00:00Z');
      const listingTime = new Date('2024-01-15T10:00:00Z'); // 24h ago
      
      const score = RankingTestUtils.calculateRecencyScore(listingTime, currentTime);
      expect(score).toBeCloseTo(0.5, 2);
    });
    
    test('should return 0.25 for 48h elapsed', () => {
      const currentTime = new Date('2024-01-17T10:00:00Z');
      const listingTime = new Date('2024-01-15T10:00:00Z'); // 48h ago
      
      const score = RankingTestUtils.calculateRecencyScore(listingTime, currentTime);
      expect(score).toBeCloseTo(0.25, 2);
    });
  });
  
  describe('Availability Scoring', () => {
    test('should return 1.0 when current time is within pickup window', () => {
      const currentTime = new Date('2024-01-15T14:00:00Z'); // 2 PM
      const pickupWindow = { start: '09:00', end: '17:00' };
      
      const score = RankingTestUtils.calculateAvailabilityScore(pickupWindow, currentTime, true);
      expect(score).toBe(1.0);
    });
    
    test('should return 0.0 when current time is outside pickup window', () => {
      const currentTime = new Date('2024-01-15T20:00:00Z'); // 8 PM
      const pickupWindow = { start: '09:00', end: '17:00' };
      
      const score = RankingTestUtils.calculateAvailabilityScore(pickupWindow, currentTime, true);
      expect(score).toBe(0.0);
    });
    
    test('should return 0.0 when item is not available', () => {
      const currentTime = new Date('2024-01-15T14:00:00Z');
      const pickupWindow = { start: '09:00', end: '17:00' };
      
      const score = RankingTestUtils.calculateAvailabilityScore(pickupWindow, currentTime, false);
      expect(score).toBe(0.0);
    });
  });
  
  describe('Staleness Penalty', () => {
    test('should return 0.0 for listings under 72h with ≤3 requests', () => {
      const currentTime = new Date('2024-01-15T10:00:00Z');
      const createdAt = new Date('2024-01-14T10:00:00Z'); // 24h ago
      
      const penalty = RankingTestUtils.calculateStalenessPenalty(createdAt, currentTime, 2);
      expect(penalty).toBe(0.0);
    });
    
    test('should return 0.2 for listings over 72h old', () => {
      const currentTime = new Date('2024-01-18T10:00:00Z');
      const createdAt = new Date('2024-01-15T09:00:00Z'); // 73h ago
      
      const penalty = RankingTestUtils.calculateStalenessPenalty(createdAt, currentTime, 2);
      expect(penalty).toBe(0.2);
    });
    
    test('should return 0.2 for listings with >3 unanswered requests', () => {
      const currentTime = new Date('2024-01-15T10:00:00Z');
      const createdAt = new Date('2024-01-15T08:00:00Z'); // 2h ago
      
      const penalty = RankingTestUtils.calculateStalenessPenalty(createdAt, currentTime, 4);
      expect(penalty).toBe(0.2);
    });
  });
  
  describe('Complete Ranking Integration', () => {
    test('should rank search results correctly with tie-breakers', () => {
      const query: SearchQuery = {
        keywords: 'phone',
        category: 'Electronics',
        userLocation: { lat: 51.5074, lng: -0.1278 },
        currentTime: new Date('2024-01-15T12:00:00Z')
      };
      
      const results = rankSearchResults(mockSearchItems, query);
      
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1'); // Should rank higher (closer, newer, less stale)
      expect(results[1].id).toBe('2'); // Should rank lower (staleness penalty)
      
      // Verify scores are calculated
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });
});

describe('Payment Ranking Algorithm Tests', () => {
  
  describe('Trust Factor Calculation', () => {
    test('should return 1.0 for escrow payment method', () => {
      const escrowMethod = mockPaymentMethods.find(m => m.type === 'escrow')!;
      const trustFactor = PaymentRankingTestUtils.calculateTrustFactor(escrowMethod, 'medium');
      expect(trustFactor).toBe(1.0);
    });
    
    test('should return 0.8 for card payment method', () => {
      const cardMethod = mockPaymentMethods.find(m => m.type === 'card')!;
      const trustFactor = PaymentRankingTestUtils.calculateTrustFactor(cardMethod, 'medium');
      expect(trustFactor).toBe(0.8);
    });
    
    test('should adjust for risk tolerance', () => {
      const cashMethod = mockPaymentMethods.find(m => m.type === 'cash')!;
      
      const lowRisk = PaymentRankingTestUtils.calculateTrustFactor(cashMethod, 'low');
      const mediumRisk = PaymentRankingTestUtils.calculateTrustFactor(cashMethod, 'medium');
      const highRisk = PaymentRankingTestUtils.calculateTrustFactor(cashMethod, 'high');
      
      expect(lowRisk).toBeLessThan(mediumRisk); // Conservative users penalize cash
      expect(highRisk).toBeGreaterThanOrEqual(mediumRisk); // Risk-tolerant users accept cash
    });
  });
  
  describe('User Preference Calculation', () => {
    test('should return 1.0 for preferred payment method', () => {
      const escrowMethod = mockPaymentMethods.find(m => m.id === 'escrow_1')!;
      const currentTime = new Date('2024-01-15T12:00:00Z');
      
      const preference = PaymentRankingTestUtils.calculateUserPreference(
        escrowMethod, 
        mockUserProfile, 
        currentTime
      );
      expect(preference).toBe(1.0);
    });
    
    test('should return 0.5 for recently used (non-preferred) method', () => {
      const cardMethod = mockPaymentMethods.find(m => m.id === 'card_1')!;
      const currentTime = new Date('2024-01-15T12:00:00Z'); // Within 3 months of last use
      
      const preference = PaymentRankingTestUtils.calculateUserPreference(
        cardMethod, 
        mockUserProfile, 
        currentTime
      );
      expect(preference).toBe(0.5);
    });
    
    test('should return 0.0 for never used method', () => {
      const cashMethod = mockPaymentMethods.find(m => m.id === 'cash_1')!;
      const currentTime = new Date('2024-01-15T12:00:00Z');
      
      const preference = PaymentRankingTestUtils.calculateUserPreference(
        cashMethod, 
        mockUserProfile, 
        currentTime
      );
      expect(preference).toBe(0.0);
    });
  });
  
  describe('Success Rate Calculation', () => {
    test('should calculate success rate from user history', () => {
      const escrowMethod = mockPaymentMethods.find(m => m.id === 'escrow_1')!;
      
      const successRate = PaymentRankingTestUtils.calculateSuccessRate(
        escrowMethod, 
        mockUserProfile
      );
      expect(successRate).toBe(0.96); // 48/50
    });
    
    test('should use default rate for methods without history', () => {
      const cashMethod = mockPaymentMethods.find(m => m.id === 'cash_1')!;
      
      const successRate = PaymentRankingTestUtils.calculateSuccessRate(
        cashMethod, 
        mockUserProfile
      );
      expect(successRate).toBe(0.85); // Default for cash
    });
  });
  
  describe('Cost Efficiency Calculation', () => {
    test('should return 1.0 for 0% transaction fee', () => {
      const cashMethod = mockPaymentMethods.find(m => m.type === 'cash')!;
      
      const efficiency = PaymentRankingTestUtils.calculateCostEfficiency(cashMethod, 100);
      expect(efficiency).toBe(1.0);
    });
    
    test('should return lower score for higher fees', () => {
      const escrowMethod = mockPaymentMethods.find(m => m.type === 'escrow')!; // 2% fee
      const cardMethod = mockPaymentMethods.find(m => m.type === 'card')!; // 2.9% fee
      
      const escrowEfficiency = PaymentRankingTestUtils.calculateCostEfficiency(escrowMethod, 100);
      const cardEfficiency = PaymentRankingTestUtils.calculateCostEfficiency(cardMethod, 100);
      
      expect(escrowEfficiency).toBeGreaterThan(cardEfficiency);
    });
  });
  
  describe('Complete Payment Ranking Integration', () => {
    test('should rank payment methods correctly', () => {
      const rankedMethods = rankPaymentMethods(
        mockPaymentMethods,
        mockUserProfile,
        100.0,
        new Date('2024-01-15T12:00:00Z')
      );
      
      expect(rankedMethods).toHaveLength(3);
      
      // Escrow should rank highest (preferred + high trust)
      expect(rankedMethods[0].id).toBe('escrow_1');
      expect(rankedMethods[0].score).toBeGreaterThan(0.8);
      
      // Verify all methods have calculated scores
      rankedMethods.forEach(method => {
        expect(method.score).toBeGreaterThanOrEqual(0);
        expect(method.score).toBeLessThanOrEqual(1);
        expect(method.details).toBeDefined();
      });
    });
    
    test('should handle tie-breaking deterministically', () => {
      // Create identical methods to test tie-breaking
      const identicalMethods: PaymentMethod[] = [
        { id: 'method_a', name: 'A Method', type: 'card', transactionFee: 0.02, available: true, requiresOnline: true },
        { id: 'method_b', name: 'B Method', type: 'card', transactionFee: 0.02, available: true, requiresOnline: true }
      ];
      
      const emptyProfile: UserPaymentProfile = {
        user_id: 'test',
        payment_history: [],
        risk_tolerance: 'medium'
      };
      
      const results = rankPaymentMethods(identicalMethods, emptyProfile, 100);
      
      // Should use alphabetical fallback
      expect(results[0].name).toBe('A Method');
      expect(results[1].name).toBe('B Method');
    });
  });
});

describe('Algorithm Performance Tests', () => {
  test('search ranking should complete within performance threshold', () => {
    const largeDataset: SearchItem[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `item_${i}`,
      name: `Product ${i}`,
      category: 'Electronics',
      tags: ['tag1', 'tag2'],
      location: { lat: 51.5074 + (Math.random() - 0.5) * 0.1, lng: -0.1278 + (Math.random() - 0.5) * 0.1 },
      listing_time: new Date(Date.now() - Math.random() * 86400000), // Within last 24h
      created_at: new Date(Date.now() - Math.random() * 259200000), // Within last 3 days
      pickup_window: { start: '09:00', end: '17:00' },
      seller_reputation: Math.random(),
      unanswered_requests: Math.floor(Math.random() * 6),
      available: Math.random() > 0.1
    }));
    
    const query: SearchQuery = {
      keywords: 'product',
      userLocation: { lat: 51.5074, lng: -0.1278 },
      currentTime: new Date()
    };
    
    const startTime = performance.now();
    const results = rankSearchResults(largeDataset, query);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    expect(results).toHaveLength(largeDataset.filter(item => item.available).length);
  });
  
  test('payment ranking should handle large method lists efficiently', () => {
    const largeMethods: PaymentMethod[] = Array.from({ length: 50 }, (_, i) => ({
      id: `method_${i}`,
      name: `Payment Method ${i}`,
      type: ['escrow', 'card', 'wallet', 'cash'][i % 4] as PaymentMethod['type'],
      transactionFee: Math.random() * 0.05,
      available: true,
      requiresOnline: Math.random() > 0.3
    }));
    
    const startTime = performance.now();
    const results = rankPaymentMethods(largeMethods, mockUserProfile, 100);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    expect(results).toHaveLength(largeMethods.length);
  });
});

export { mockSearchItems, mockPaymentMethods, mockUserProfile };