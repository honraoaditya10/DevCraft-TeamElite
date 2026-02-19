/**
 * Redis Cache Manager for Node.js
 * High-performance caching for eligibility results, rules, and user data
 */

import redis from 'redis';
import { promisify } from 'util';

let redisClient = null;
let isConnected = false;

export async function initRedis(host = 'localhost', port = 6379, password = null) {
  try {
    const options = {
      host,
      port,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    };

    if (password) {
      options.password = password;
    }

    redisClient = redis.createClient(options);

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected');
      isConnected = true;
    });

    await redisClient.connect();
    return true;
  } catch (err) {
    console.warning('Redis init failed:', err.message);
    return false;
  }
}

export function getRedisClient() {
  return { client: redisClient, isConnected };
}

/**
 * Eligibility Cache
 */
export async function getUserEligibility(userId) {
  if (!isConnected) return null;
  try {
    const data = await redisClient.get(`eligibility:${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get failed:', err.message);
    return null;
  }
}

export async function setUserEligibility(userId, result, ttl = 7200) {
  if (!isConnected) return false;
  try {
    await redisClient.setEx(
      `eligibility:${userId}`,
      ttl,
      JSON.stringify(result)
    );
    return true;
  } catch (err) {
    console.error('Cache set failed:', err.message);
    return false;
  }
}

export async function invalidateUserEligibility(userId) {
  if (!isConnected) return false;
  try {
    await redisClient.del(`eligibility:${userId}`);
    return true;
  } catch (err) {
    console.error('Cache invalidate failed:', err.message);
    return false;
  }
}

/**
 * Rule Cache
 */
export async function getRule(schemeId) {
  if (!isConnected) return null;
  try {
    const data = await redisClient.get(`rule:${schemeId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Rule cache get failed:', err.message);
    return null;
  }
}

export async function setRule(schemeId, rule, ttl = 86400) {
  if (!isConnected) return false;
  try {
    await redisClient.setEx(
      `rule:${schemeId}`,
      ttl,
      JSON.stringify(rule)
    );
    return true;
  } catch (err) {
    console.error('Rule cache set failed:', err.message);
    return false;
  }
}

/**
 * Query Result Cache
 */
export async function getQueryResult(queryHash) {
  if (!isConnected) return null;
  try {
    const data = await redisClient.get(`query:${queryHash}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Query cache get failed:', err.message);
    return null;
  }
}

export async function setQueryResult(queryHash, result, ttl = 14400) {
  if (!isConnected) return false;
  try {
    await redisClient.setEx(
      `query:${queryHash}`,
      ttl,
      JSON.stringify(result)
    );
    return true;
  } catch (err) {
    console.error('Query cache set failed:', err.message);
    return false;
  }
}

/**
 * Cache Statistics
 */
export async function getCacheStats() {
  if (!isConnected) {
    return { status: 'disconnected' };
  }

  try {
    const info = await redisClient.info('memory');
    const dbSize = await redisClient.dbSize();

    return {
      status: 'connected',
      memory: info.split('\r\n').find((line) => line.startsWith('used_memory_human'))?.split(':')[1],
      keys: dbSize,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Stats retrieval failed:', err.message);
    return { status: 'error', error: err.message };
  }
}

/**
 * Clear Cache
 */
export async function clearCache() {
  if (!isConnected) return false;
  try {
    await redisClient.flushDb();
    console.log('Cache cleared');
    return true;
  } catch (err) {
    console.error('Cache clear failed:', err.message);
    return false;
  }
}

/**
 * Decorator for caching async functions
 */
export function cached(prefix = 'app', ttl = 3600) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      if (!isConnected) {
        return originalMethod.apply(this, args);
      }

      const cacheKey = `${prefix}:${propertyKey}:${JSON.stringify(args)}`;

      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Cache hit: ${cacheKey}`);
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn('Cache check failed:', err.message);
      }

      const result = await originalMethod.apply(this, args);

      try {
        await redisClient.setEx(cacheKey, ttl, JSON.stringify(result));
      } catch (err) {
        console.warn('Cache set failed:', err.message);
      }

      return result;
    };

    return descriptor;
  };
}

export default {
  initRedis,
  getRedisClient,
  getUserEligibility,
  setUserEligibility,
  invalidateUserEligibility,
  getRule,
  setRule,
  getQueryResult,
  setQueryResult,
  getCacheStats,
  clearCache,
  cached
};
