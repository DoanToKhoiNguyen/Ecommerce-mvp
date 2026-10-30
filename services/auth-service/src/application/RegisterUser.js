const User = require('../domain/User');
const { AppError } = require('../domain/errors');

class RegisterUser {
    constructor({ userRepo, hasher, publisher }) {
        Object.assign(this, { userRepo, hasher, publisher });
    }

    async execute(input) {
        User.validateRegistration(input);
        const { username, password, email, phone } = input;

        if (await this.userRepo.existsByUsernameOrEmail(username, email))
            throw new AppError(409, 'Username or email already exists');

        const passwordHash = await this.hasher.hash(password);
        const uid = await this.userRepo.create({
            username, passwordHash, email, phone, roleName: 'CUSTOMER', // đăng ký luôn là CUSTOMER
        });

        try {
            await this.publisher.publish('user-registered', uid, { uid, username, email, phone });
        } catch (e) {
            console.error('[auth] publish user-registered failed:', e.message);
        }
        return { uid };
    }
}
module.exports = RegisterUser;