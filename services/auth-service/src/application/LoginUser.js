const { AppError } = require('../domain/errors');

class LoginUser {
    constructor({ userRepo, hasher, tokens }) {
        Object.assign(this, { userRepo, hasher, tokens });
    }

    async execute({ username, password }) {
        if (!username || !password) throw new AppError(400, 'username and password are required');

        const user = await this.userRepo.findByUsername(username);
        const ok = user && (await this.hasher.compare(password, user.password));
        if (!ok) throw new AppError(401, 'Invalid username or password');

        return {
            accessToken: this.tokens.sign({ uid: user.uid, role: user.role }),
            tokenType: 'Bearer',
            expiresIn: this.tokens.expiresIn,
        };
    }
}
module.exports = LoginUser;