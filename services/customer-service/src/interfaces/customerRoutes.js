const express = require('express');
const { AppError } = require('../domain/errors');

// Gateway đã xác thực JWT và gắn x-user-id, x-user-role
const isAdmin = (req) => req.headers['x-user-role'] === 'ADMIN';
const guardOwner = (req, uid) => {
    if (!Number.isInteger(uid)) throw new AppError(400, 'uid must be an integer');
    if (!isAdmin(req) && req.headers['x-user-id'] !== String(uid)) throw new AppError(403, 'Forbidden');
};

module.exports = ({ getCustomer, updateCustomer }) => {
    const router = express.Router();

    router.get('/:uid', async (req, res, next) => {
        try {
            const uid = Number(req.params.uid);
            guardOwner(req, uid);
            const { fullname, mid } = await getCustomer.execute(uid);
            res.json({ uid, fullname, mid });
        } catch (e) { next(e); }
    });

    router.get('/:uid/membership', async (req, res, next) => {
        try {
            const uid = Number(req.params.uid);
            guardOwner(req, uid);
            const { mid, mname, score } = await getCustomer.execute(uid);
            res.json({ uid, mid, mname, score });
        } catch (e) { next(e); }
    });

    router.put('/:uid', async (req, res, next) => {
        try {
            const uid = Number(req.params.uid);
            guardOwner(req, uid);
            res.json(await updateCustomer.execute({ uid, body: req.body || {}, isAdmin: isAdmin(req) }));
        } catch (e) { next(e); }
    });

    return router;
};