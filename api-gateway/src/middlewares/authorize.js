const jwt = require('jsonwebtoken');
const policies = require('../policy');

module.exports = (req, res, next) => {
    const path = req.originalUrl.split('?')[0];

    // Chống giả mạo: luôn xóa header danh tính do client tự gửi
    delete req.headers['x-user-id'];
    delete req.headers['x-user-role'];

    const rule = policies.find((p) => p.method === req.method && p.path.test(path));
    if (!rule) return res.status(404).json({ message: 'Route not found' });
    if (rule.public) return next();

    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme !== 'Bearer' || !token)
        return res.status(401).json({ message: 'Missing or invalid token' });

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: 'Missing or invalid token' });
    }

    if (!rule.roles.includes(payload.role))
        return res.status(403).json({ message: 'Forbidden' });

    // Gateway xác thực, service phía sau chỉ tin các header này
    req.user = { uid: payload.sub, role: payload.role };
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-role'] = payload.role;
    next();
};
