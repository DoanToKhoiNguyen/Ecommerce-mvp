const { AppError } = require('./errors');

class Customer {
    static validateUpdate({ fullname, mid }) {
        if (fullname === undefined && mid === undefined)
            throw new AppError(400, 'fullname or mid is required');
        if (fullname !== undefined &&
            (typeof fullname !== 'string' || !fullname.trim() || fullname.length > 100))
            throw new AppError(400, 'fullname must be 1-100 characters');
        if (mid !== undefined && !Number.isInteger(mid))
            throw new AppError(400, 'mid must be an integer');
    }
}
module.exports = Customer;