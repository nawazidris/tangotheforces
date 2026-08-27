/**
 * Cache Service - Handles data caching with TTL and memory optimization
 */

const CacheService = (() => {
    const cache = new Map();
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for runtime cache

    return {
        get(key) {
            const item = cache.get(key);
            if (!item) return null;

            if (Date.now() - item.timestamp > CACHE_TTL) {
                cache.delete(key);
                return null;
            }

            return item.data;
        },

        set(key, data) {
            cache.set(key, {
                data,
                timestamp: Date.now()
            });
        },

        clear() {
            cache.clear();
        },

        has(key) {
            return this.get(key) !== null;
        }
    };
})();
