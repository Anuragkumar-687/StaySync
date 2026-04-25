const redis = require('redis');

/**
 * Redis Configuration — Connects to remote Redis via TCP URL from .env
 * Supports: Redis Cloud, Upstash, Railway, Render, Aiven, etc.
 * 
 * Set REDIS_URL in .env like:
 *   redis://default:password@host:port
 *   rediss://default:password@host:port  (with TLS)
 */

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.log('⚠️  REDIS_URL not set in .env — running without cache');
}

let redisClient = null;

if (REDIS_URL) {
  try {
    const options = {
      url: REDIS_URL,
      socket: {
        connectTimeout: 10000,       // 10s connection timeout
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.log('Redis: Max reconnect attempts reached');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 500, 3000); // Retry with backoff: 500ms, 1s, 1.5s...
        },
      },
    };

    // Auto-detect TLS from rediss:// protocol
    if (REDIS_URL.startsWith('rediss://')) {
      options.socket.tls = true;
      options.socket.rejectUnauthorized = false;
    }

    redisClient = redis.createClient(options);

    redisClient.on('error', (err) => {
      console.log('Redis Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    redisClient.connect().catch((err) => {
      console.log('Redis connection failed:', err.message);
    });
  } catch (err) {
    console.log('Redis init error:', err.message);
    redisClient = null;
  }
}

/**
 * Safe Redis Proxy — returns no-op when Redis is unavailable
 * This prevents the app from crashing if Redis goes down
 */
const safeRedis = new Proxy(redisClient || {}, {
  get(target, prop) {
    // If Redis client doesn't exist or isn't connected, return safe no-ops
    if (!redisClient || !redisClient.isReady) {
      if (prop === 'get') return async () => null;
      if (prop === 'setEx') return async () => null;
      if (prop === 'set') return async () => null;
      if (prop === 'del') return async () => null;
      if (prop === 'flushAll') return async () => null;
      if (prop === 'isReady') return false;
      return typeof target[prop] === 'function' ? () => {} : target[prop];
    }
    return target[prop];
  },
});

module.exports = safeRedis;
