// Việt Nam là UTC+7, không có giờ mùa hè
const toVN = (d = new Date()) =>
    new Date(new Date(d).getTime() + 7 * 3600 * 1000).toISOString().replace('Z', '+07:00');

module.exports = { toVN };