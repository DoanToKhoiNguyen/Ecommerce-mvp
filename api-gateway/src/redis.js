const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
    maxRetriesPerRequest: 1, // Redis lỗi thì báo lỗi nhanh, không treo request
});
redis.on('error', (e) => console.error('[gateway] redis error:', e.message));
redis.on('connect', () => console.log('[gateway] redis connected'));

module.exports = redis;
