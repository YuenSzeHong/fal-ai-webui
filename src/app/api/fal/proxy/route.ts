import { route } from "@fal-ai/server-proxy/nextjs";

// Check if FAL_KEY is set
if (!process.env.FAL_KEY) {
  console.error('[Server] FAL_KEY environment variable is not set. Please add it to .env.local');
}

/**
 * FAL.AI Proxy Endpoint
 * 
 * IMPORTANT NOTES:
 * 
 * 1. COSTS:
 *    - Model inference (via this proxy) DOES cost money based on fal.ai pricing
 *    - Rate limits are enforced by fal.ai (not us)
 *    - Each model has different pricing - check https://fal.ai/pricing
 * 
 * 2. MODEL LIST ENDPOINTS (/api/models/*):
 *    - These endpoints return static JSON (hardcoded model lists)
 *    - They DO NOT call fal.ai API
 *    - They DO NOT cost money
 *    - They DO NOT require FAL_KEY
 *    - We apply our own rate limiting (100 req/min per IP)
 * 
 * 3. RATE LIMITING:
 *    - fal.ai enforces their own rate limits
 *    - Rate limit errors (429) from fal.ai are passed through to the client
 *    - Check response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 * 
 * 4. ERROR HANDLING:
 *    - All fal.ai errors are wrapped and returned to the client
 *    - Client should handle 429 (rate limit) and 402 (payment required) responses
 */

export const { GET, POST, PUT } = route; 