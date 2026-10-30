const jwt = require('jsonwebtoken');

const expiresIn = Number(process.env.JWT_EXPIRES_IN || 3600);

module.exports = {
    expiresIn,
    sign: ({ uid, role }) =>
        jwt.sign({ sub: String(uid), role }, process.env.JWT_SECRET, { expiresIn }),
};