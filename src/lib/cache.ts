import 'server-only';
import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client instance (lazy connect)
const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
});

let redisConnectPromise: Promise<void> | null = null;

/** Establish the lazy Redis connection once, sharing concurrent attempts. */
export async function connectRedisClient(): Promise<void> {
    if (redisClient.status === 'ready') return;
    if (redisConnectPromise) return redisConnectPromise;

    redisConnectPromise = redisClient.connect()
        .then(() => undefined)
        .finally(() => {
            redisConnectPromise = null;
        });
    return redisConnectPromise;
}

redisClient.on('error', (error) => {
    logger.error('[Redis] Connection error', error);
});

redisClient.on('connect', () => {
    logger.info('[Redis] Connected successfully');
});

export function getRedisClient(): Redis {
    return redisClient;
}

/** Gracefully close Redis during server shutdown or test teardown. */
export async function closeRedisClient(): Promise<void> {
    if (redisClient.status === 'end') return;
    if (redisClient.status === 'wait') {
        redisClient.disconnect();
        return;
    }
    await redisClient.quit();
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    process.once('SIGTERM', () => void closeRedisClient());
    process.once('SIGINT', () => void closeRedisClient());
}

async function getConnectedRedisClient(): Promise<Redis> {
    await connectRedisClient();
    return redisClient;
}

// Cache service wrapper for compatibility
export const CacheService = {
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const client = await getConnectedRedisClient();
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`[CacheService] Get error for key ${key}:`, error);
            return null;
        }
    },

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        try {
            const client = await getConnectedRedisClient();
            const stringValue = JSON.stringify(value);
            if (ttlSeconds) {
                await client.setex(key, ttlSeconds, stringValue);
            } else {
                await client.set(key, stringValue);
            }
        } catch (error) {
            logger.error(`[CacheService] Set error for key ${key}:`, error);
        }
    },

    async del(key: string): Promise<void> {
        try {
            const client = await getConnectedRedisClient();
            await client.del(key);
        } catch (error) {
            logger.error(`[CacheService] Delete error for key ${key}:`, error);
        }
    },

    async mdel(keys: string[]): Promise<void> {
        if (!keys.length) return;
        try {
            const client = await getConnectedRedisClient();
            await client.del(...keys);
        } catch (error) {
            logger.error(`[CacheService] MDelete error for keys:`, error);
        }
    },

    async invalidate(key: string): Promise<void> {
        return this.del(key);
    },

    async invalidatePattern(pattern: string): Promise<void> {
        try {
            const client = await getConnectedRedisClient();
            // Stream keys with SCAN instead of KEYS to avoid blocking Redis
            // (KEYS blocks the single-threaded event loop on large datasets).
            const keysToDelete: string[] = [];
            let cursor = '0';
            do {
                const [nextCursor, matched] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = nextCursor;
                if (matched.length > 0) {
                    keysToDelete.push(...matched);
                }
            } while (cursor !== '0');

            if (keysToDelete.length > 0) {
                // Delete in chunks to keep each DEL command bounded.
                const chunkSize = 200;
                for (let i = 0; i < keysToDelete.length; i += chunkSize) {
                    const chunk = keysToDelete.slice(i, i + chunkSize);
                    await client.del(...chunk);
                }
            }
        } catch (error) {
            logger.error(`[CacheService] Invalidate pattern error for ${pattern}:`, error);
        }
    },

    /**
     * Deliberately disabled: FLUSHALL is process-wide and can destroy unrelated
     * tenants/data. Use invalidatePattern with an explicitly scoped namespace.
     */
    async flushAll(): Promise<never> {
        throw new Error('CacheService.flushAll is disabled; invalidate a scoped namespace instead');
    },

    async getOrSet<T = any>(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
        const cached = await CacheService.get<T>(key);
        if (cached !== null) {
            return cached;
        }
        const value = await fetchFn();
        await CacheService.set(key, value, ttlSeconds);
        return value;
    },
};
