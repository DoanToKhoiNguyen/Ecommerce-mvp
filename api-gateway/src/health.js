const redis = require('./redis');

const SERVICES = {
    auth: `${process.env.AUTH_URL}/health`,
    customer: `${process.env.CUSTOMER_URL}/health`,
    product: `${process.env.PRODUCT_URL}/health`,
    order: `${process.env.ORDER_URL}/health`,
    shipment: `${process.env.SHIPMENT_URL}/health`,
};
// Chỉ kiểm tra những service đã được bật (mỗi bước sau sẽ thêm vào biến HEALTH_SERVICES)
const enabled = (process.env.HEALTH_SERVICES || Object.keys(SERVICES).join(','))
    .split(',').map((s) => s.trim()).filter(Boolean);

async function ping(url) {
    try {
        const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
        return r.ok ? 'UP' : 'DOWN';
    } catch {
        return 'DOWN';
    }
}

module.exports = async (req, res) => {
    const dependencies = {};
    await Promise.all(enabled.map(async (name) => { dependencies[name] = await ping(SERVICES[name]); }));
    try { dependencies.redis = (await redis.ping()) === 'PONG' ? 'UP' : 'DOWN'; }
    catch { dependencies.redis = 'DOWN'; }

    const allUp = Object.values(dependencies).every((s) => s === 'UP');
    res.status(allUp ? 200 : 503).json(
        allUp
            ? { status: 'UP', message: 'E-commerce API is running', dependencies }
            : { status: 'DOWN', message: 'A required dependency is unavailable', dependencies }
    );
};
