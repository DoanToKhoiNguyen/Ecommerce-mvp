const express = require('express');
const { AppError } = require('../domain/errors');

// Gateway đã xác thực JWT và gắn x-user-id, x-user-role
const who = (req) => ({
    uid: Number(req.headers['x-user-id']),
    isCustomer: req.headers['x-user-role'] === 'CUSTOMER',
});
const intParam = (v, name) => {
    const n = Number(v);
    if (!Number.isInteger(n)) throw new AppError(400, `${name} must be an integer`);
    return n;
};

module.exports = ({ getShipment, updateStatus }) => {
    const router = express.Router();

    // Mở rộng: tra Shipment theo oid (khai báo trước '/:shipid')
    router.get('/', async (req, res, next) => {
        try {
            const oid = intParam(req.query.oid, 'oid');
            res.json(await getShipment.byOid({ oid, ...who(req) }));
        } catch (e) { next(e); }
    });

    router.get('/:shipid', async (req, res, next) => {
        try {
            const shipid = intParam(req.params.shipid, 'shipid');
            res.json(await getShipment.byId({ shipid, ...who(req) }));
        } catch (e) { next(e); }
    });

    router.patch('/:shipid/status', async (req, res, next) => {
        try {
            const shipid = intParam(req.params.shipid, 'shipid');
            res.json(await updateStatus.execute({ shipid, status: (req.body || {}).status }));
        } catch (e) { next(e); }
    });

    return router;
};