const express = require('express');
const { AppError } = require('../domain/errors');

// Gateway đã xác thực JWT và gắn x-user-id, x-user-role
const who = (req) => {
    const uid = Number(req.headers['x-user-id']);
    if (!Number.isInteger(uid)) throw new AppError(401, 'Unauthorized');
    return { uid, isAdmin: req.headers['x-user-role'] === 'ADMIN' };
};

module.exports = ({ placeOrder, getOrder }) => {
    const router = express.Router();

    router.post('/', async (req, res, next) => {
        try {
            const { uid } = who(req);
            res.status(201).json(await placeOrder.execute({ uid, items: (req.body || {}).items }));
        } catch (e) { next(e); }
    });

    router.get('/', async (req, res, next) => {
        try { res.json(await getOrder.list(who(req))); } catch (e) { next(e); }
    });

    router.get('/:oid', async (req, res, next) => {
        try {
            const oid = Number(req.params.oid);
            if (!Number.isInteger(oid)) throw new AppError(400, 'oid must be an integer');
            res.json(await getOrder.get({ oid, ...who(req) }));
        } catch (e) { next(e); }
    });

    return router;
};