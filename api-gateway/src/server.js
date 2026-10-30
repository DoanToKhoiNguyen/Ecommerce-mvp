const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authorize = require('./middlewares/authorize');
const rateLimit = require('./middlewares/rateLimit');
const cache = require('./middlewares/cache');
const health = require('./health');

const app = express();
// Lưu ý: KHÔNG dùng express.json() ở gateway, vì sẽ làm mất body khi proxy

morgan.token('uid', (req) => (req.user ? `${req.user.uid}(${req.user.role})` : '-'));
app.use(morgan(':method :url :status :response-time ms uid=:uid'));

// Health check (public, không qua rate limit)
app.get('/api/health', health);

// Rate limiting (Redis)
app.use('/api', rateLimit({ scope: 'global', limit: Number(process.env.RATE_LIMIT || 100) }));
app.post('/api/auth/login', rateLimit({ scope: 'login', limit: Number(process.env.LOGIN_RATE_LIMIT || 10) }));

// Authentication + Authorization
app.use('/api', authorize);

// Routing
const proxy = (prefix, target, extra = {}) =>
    createProxyMiddleware(prefix, {
        target,
        changeOrigin: true,
        onError: (err, req, res) => {
            console.error(`[gateway] ${prefix} -> ${target}: ${err.code || err.message}`);
            if (!res.headersSent) res.status(502).json({ message: 'Service unavailable' });
        },
        ...extra,
    });

app.use(proxy('/api/auth', process.env.AUTH_URL));
app.use(proxy('/api/customers', process.env.CUSTOMER_URL));

// Product: có cache bằng Redis
app.use('/api/products', cache.read);
app.use(proxy('/api/products', process.env.PRODUCT_URL, {
    selfHandleResponse: true,
    onProxyRes: cache.write,
}));

app.use(proxy('/api/orders', process.env.ORDER_URL));
app.use(proxy('/api/shipments', process.env.SHIPMENT_URL));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`[gateway] listening on ${port}`));
