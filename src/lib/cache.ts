/**
 * Simple in-memory cache with TTL support
 * Used for caching model lists and schemas to reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;

  constructor() {
    // Don't initialize during construction to avoid build-time issues
  }
  
  private ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Only start cleanup interval at runtime, not during build
    if (typeof setInterval === 'undefined') return;
    
    // Skip if we're in build phase
    if (typeof process !== 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Set a value in the cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.ensureInitialized();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    this.ensureInitialized();
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Destroy the cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Singleton instance
const cache = new SimpleCache();

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  MODEL_LIST: 10 * 60 * 1000,      // 10 minutes for model lists
  SCHEMA: 15 * 60 * 1000,          // 15 minutes for schemas
  SHORT: 2 * 60 * 1000,            // 2 minutes for short-lived data
  LONG: 60 * 60 * 1000,            // 1 hour for long-lived data
};

export default cache;
