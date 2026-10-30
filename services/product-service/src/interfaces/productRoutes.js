const express = require('express');
const { AppError } = require('../domain/errors');

const pidOf = (req) => {
    const pid = Number(req.params.pid);
    if (!Number.isInteger(pid)) throw new AppError(400, 'pid must be an integer');
    return pid;
};

// Quyền (ai được ghi) đã được gateway kiểm tra
module.exports = ({ manageProduct }) => {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
        try { res.json(await manageProduct.list()); } catch (e) { next(e); }
    });

    router.get('/:pid', async (req, res, next) => {
        try { res.json(await manageProduct.get(pidOf(req))); } catch (e) { next(e); }
    });

    router.post('/', async (req, res, next) => {
        try { res.status(201).json(await manageProduct.create(req.body || {})); } catch (e) { next(e); }
    });

    router.put('/:pid', async (req, res, next) => {
        try { res.json(await manageProduct.update(pidOf(req), req.body || {})); } catch (e) { next(e); }
    });

    router.delete('/:pid', async (req, res, next) => {
        try { res.json(await manageProduct.remove(pidOf(req))); } catch (e) { next(e); }
    });

    return router;
};