import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  blocked?: boolean;
  blockExpiresAt?: string;
}

interface UseRateLimitReturn {
  checkRateLimit: (identifier: string, type?: string) => Promise<RateLimitResponse>;
  recordAttempt: (identifier: string, type?: string) => Promise<void>;
  isChecking: boolean;
  isRecording: boolean;
}

export const useRateLimit = (): UseRateLimitReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const checkRateLimit = useCallback(async (
    identifier: string, 
    type: string = 'api_request'
  ): Promise<RateLimitResponse> => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          action: 'check',
          identifier,
          type,
          userAgent: navigator.userAgent,
          ip: null // Will be filled by edge function
        }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // On error, allow the request but log it
        return { allowed: true, remaining: 0 };
      }

      return data;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: 0 };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const recordAttempt = useCallback(async (
    identifier: string, 
    type: string = 'api_request'
  ): Promise<void> => {
    setIsRecording(true);
    try {
      const { error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          action: 'record',
          identifier,
          type,
          userAgent: navigator.userAgent,
          ip: null // Will be filled by edge function
        }
      });

      if (error) {
        console.error('Failed to record rate limit attempt:', error);
      }
    } catch (error) {
      console.error('Error recording rate limit attempt:', error);
    } finally {
      setIsRecording(false);
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    isChecking,
    isRecording
  };
};