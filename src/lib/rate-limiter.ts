// Simple in-memory rate limiter for API endpoints
// Note: In production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up expired entries every minute
    // Skip during build time to avoid Deno compatibility issues
    if (typeof setInterval !== 'undefined' && typeof process !== 'undefined') {
      // Only run cleanup in runtime, not during build
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        setInterval(() => this.cleanup(), 60000);
      }
    }
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // If no entry or window expired, create new entry
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.limits.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.limits.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.limits.delete(key));
  }
}

// Create rate limiter instances for different endpoints
// Models endpoint: 100 requests per minute per IP
export const modelsRateLimiter = new RateLimiter(100, 60000);

// Proxy endpoint rate limiting is handled by fal.ai
// We just pass through their rate limit headers

export function getRateLimitKey(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
}

export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
      },
    }
  );
}

export function addRateLimitHeaders(response: Response, remaining: number, resetTime: number): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-RateLimit-Limit', '100');
  newHeaders.set('X-RateLimit-Remaining', remaining.toString());
  newHeaders.set('X-RateLimit-Reset', Math.floor(resetTime / 1000).toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
