const express = require('express');
const { migrate } = require('./infrastructure/db');
const publisher = require('./infrastructure/EventPublisher');
const UserRepository = require('./infrastructure/UserRepository');
const hasher = require('./infrastructure/PasswordHasher');
const tokens = require('./infrastructure/TokenService');
const RegisterUser = require('./application/RegisterUser');
const LoginUser = require('./application/LoginUser');
const authRoutes = require('./interfaces/authRoutes');
const customers = require('./infrastructure/CustomerDirectory');
const userRepo = new UserRepository();
const registerUser = new RegisterUser({ userRepo, hasher, publisher });
const loginUser = new LoginUser({ userRepo, hasher, tokens, customers });
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'auth-service' }));
app.use('/api/auth', authRoutes({ registerUser, loginUser }));

app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

(async () => {
    await migrate();
    publisher.connect().catch((e) => console.error('[auth] kafka not ready yet:', e.message));
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`[auth] listening on ${port}`));
})();