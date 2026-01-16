import { NextResponse } from 'next/server';
import { modelsRateLimiter, getRateLimitKey, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isVideoModel?: boolean; // NEW: Flag indicating if model supports video
  supportsSafetyFilter?: boolean; // Indicates if model supports disabling safety filter
  safetyFilterNote?: string; // Additional note about safety filter behavior
}

export function createModelResponse(category: string, models: ModelInfo[], request: Request) {
  try {
    // Apply rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = modelsRateLimiter.check(rateLimitKey);
    
    if (!rateLimit.allowed) {
      console.warn(`[Server] Rate limit exceeded for ${category} models - IP: ${rateLimitKey}`);
      return createRateLimitResponse(rateLimit.resetTime);
    }
    
    console.log(`[Server] Fetching ${category} models - ${models.length} models available`);
    const response = NextResponse.json({ models });
    return addRateLimitHeaders(response, rateLimit.remaining, rateLimit.resetTime);
  } catch (error) {
    console.error(`[Server] Error fetching ${category} models:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch models', models: [] },
      { status: 500 }
    );
  }
}

