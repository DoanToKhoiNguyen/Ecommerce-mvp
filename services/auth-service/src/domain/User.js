const { AppError } = require('./errors');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class User {
    static validateRegistration({ username, password, email, phone }) {
        if (!username || typeof username !== 'string' || username.trim().length < 3 || username.length > 50)
            throw new AppError(400, 'username is required (3-50 characters)');
        if (!password || typeof password !== 'string' || password.length < 6)
            throw new AppError(400, 'password is required (min 6 characters)');
        if (email && !EMAIL_RE.test(email)) throw new AppError(400, 'email is invalid');
        if (phone && !/^[0-9+]{8,15}$/.test(phone)) throw new AppError(400, 'phone is invalid');
    }
}
module.exports = User;