import { CacheEntry } from '../types/linkedin';

const CACHE_PREFIX = 'linkedin_dashboard_';
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

export class CacheManager {
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      
      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static clear(key?: string): void {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key);
    } else {
      // Clear all cache entries
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    }
  }

  static isValid(key: string): boolean {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return false;

      const entry: CacheEntry<any> = JSON.parse(cached);
      return Date.now() - entry.timestamp <= entry.ttl;
    } catch {
      return false;
    }
  }
}