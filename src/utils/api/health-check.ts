/**
 * API Health Check Utilities
 * Tests API connectivity and provides fallback mechanisms
 */

import { safeApiClient, formatErrorMessage } from './client';

interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

export class ApiHealthCheck {
  private static instance: ApiHealthCheck;
  private healthStatus: boolean = true;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds

  static getInstance(): ApiHealthCheck {
    if (!ApiHealthCheck.instance) {
      ApiHealthCheck.instance = new ApiHealthCheck();
    }
    return ApiHealthCheck.instance;
  }

  async checkHealth(force: boolean = false): Promise<HealthCheckResult> {
    const now = Date.now();
    
    // Skip check if recently performed (unless forced)
    if (!force && (now - this.lastCheck) < this.checkInterval) {
      return {
        isHealthy: this.healthStatus,
        responseTime: 0
      };
    }

    const startTime = Date.now();
    
    try {
      const response = await safeApiClient.get('/health');
      const responseTime = Date.now() - startTime;
      
      this.healthStatus = response.success;
      this.lastCheck = now;
      
      return {
        isHealthy: response.success,
        responseTime,
        error: response.success ? undefined : response.error
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.healthStatus = false;
      this.lastCheck = now;
      
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isHealthy(): boolean {
    return this.healthStatus;
  }

  async waitForHealthy(timeout: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await this.checkHealth(true);
      if (result.isHealthy) {
        return true;
      }
      
      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }
}

// Singleton instance
export const healthCheck = ApiHealthCheck.getInstance();

// Auto-check health on module load (with timeout)
export const initializeHealthCheck = async () => {
  try {
    const result = await Promise.race([
      healthCheck.checkHealth(true),
      new Promise<HealthCheckResult>((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ]);
    
    console.log('API Health Check:', result);
  } catch (error) {
    console.warn('API Health Check failed:', error);
  }
};

// Utility function to wrap API calls with health check
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackValue?: T
): Promise<T> {
  try {
    // Quick health check
    const isHealthy = healthCheck.isHealthy();
    
    if (!isHealthy) {
      console.warn('API unhealthy, using fallback');
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw new Error('API unavailable');
    }
    
    return await apiCall();
  } catch (error) {
    console.warn('API call failed:', error);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    throw error;
  }
}

export default healthCheck;