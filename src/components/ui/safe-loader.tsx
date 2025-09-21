/**
 * Safe Loader Component
 * Provides timeout protection for loading states
 */

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';
import { SimpleErrorFallback } from './error-boundary';

interface SafeLoaderProps {
  children: React.ReactNode;
  timeout?: number;
  fallback?: React.ReactNode;
  onTimeout?: () => void;
}

export function SafeLoader({ 
  children, 
  timeout = 15000, 
  fallback,
  onTimeout 
}: SafeLoaderProps) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (isTimedOut) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <SimpleErrorFallback 
        error={new Error('Loading timeout')} 
        reset={() => window.location.reload()} 
      />
    );
  }

  return <>{children}</>;
}

// Hook for timeout protection
export function useTimeout(callback: () => void, delay: number) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      callback();
    }, delay);

    return () => clearTimeout(timer);
  }, [callback, delay]);

  return { isTimedOut, resetTimeout: () => setIsTimedOut(false) };
}

export default SafeLoader;