const express = require('express');

module.exports = ({ registerUser, loginUser }) => {
    const router = express.Router();

    router.post('/register', async (req, res, next) => {
        try {
            const { uid } = await registerUser.execute(req.body || {});
            res.status(201).json({ message: 'User registered successfully', uid });
        } catch (e) { next(e); }
    });

    router.post('/login', async (req, res, next) => {
        try {
            res.status(200).json(await loginUser.execute(req.body || {}));
        } catch (e) { next(e); }
    });

    return router;
};