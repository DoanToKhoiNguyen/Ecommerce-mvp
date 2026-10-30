const Customer = require('../domain/Customer');
const { AppError } = require('../domain/errors');

class UpdateCustomer {
    constructor({ customerRepo }) { this.customerRepo = customerRepo; }

    async execute({ uid, body, isAdmin }) {
        const { fullname, mid } = body;
        Customer.validateUpdate({ fullname, mid });
        if (mid !== undefined && !isAdmin)
            throw new AppError(403, 'Only admin can change membership');

        if (!(await this.customerRepo.findWithMembership(uid)))
            throw new AppError(404, 'Customer not found');
        if (mid !== undefined && !(await this.customerRepo.membershipExists(mid)))
            throw new AppError(400, 'Membership does not exist');

        await this.customerRepo.update(uid, { fullname: fullname?.trim(), mid });
        return { message: 'Customer updated successfully', uid };
    }
}
module.exports = UpdateCustomer;