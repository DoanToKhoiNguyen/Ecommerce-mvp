const redis = require('../redis');

module.exports = ({ scope, limit, windowSec = 60 }) => async (req, res, next) => {
    const key = `rl:${scope}:${req.ip}`;
    try {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSec);

        res.set('X-RateLimit-Limit', String(limit));
        res.set('X-RateLimit-Remaining', String(Math.max(0, limit - count)));

        if (count > limit) {
            res.set('Retry-After', String(await redis.ttl(key)));
            return res.status(429).json({ message: 'Too many requests' });
        }
    } catch (e) {
        console.error('[gateway] rate limit skipped:', e.message); // Redis lỗi thì cho qua
    }
    next();
};
