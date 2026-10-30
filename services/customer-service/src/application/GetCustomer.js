const { AppError } = require('../domain/errors');

class GetCustomer {
    constructor({ customerRepo }) { this.customerRepo = customerRepo; }

    async execute(uid) {
        const c = await this.customerRepo.findWithMembership(uid);
        if (!c) throw new AppError(404, 'Customer not found');
        return c; // { uid, fullname, mid, mname, score }
    }
}
module.exports = GetCustomer;