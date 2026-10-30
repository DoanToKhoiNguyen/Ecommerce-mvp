const { responseInterceptor } = require('http-proxy-middleware');
const redis = require('../redis');

const TTL = Number(process.env.CACHE_TTL || 60);
const key = (req) => `cache:products:${req.originalUrl}`;

// 1) Trả thẳng từ Redis nếu có
async function read(req, res, next) {
    if (req.method !== 'GET') return next();
    try {
        const hit = await redis.get(key(req));
        if (hit) {
            res.set('X-Cache', 'HIT').type('application/json').send(hit);
            return;
        }
    } catch (e) {
        console.error('[gateway] cache read skipped:', e.message);
    }
    next();
}

async function invalidate() {
    const keys = await redis.keys('cache:products:*');
    if (keys.length) await redis.del(keys);
}

// 2) Chặn response từ service để ghi cache (GET) hoặc xóa cache (ghi dữ liệu)
const write = responseInterceptor(async (buffer, proxyRes, req, res) => {
    try {
        if (req.method === 'GET') {
            if (proxyRes.statusCode === 200)
                await redis.set(key(req), buffer.toString('utf8'), 'EX', TTL);
            res.setHeader('X-Cache', 'MISS');
        } else if (proxyRes.statusCode < 300) {
            await invalidate();
        }
    } catch (e) {
        console.error('[gateway] cache write skipped:', e.message);
    }
    return buffer;
});

module.exports = { read, write };
