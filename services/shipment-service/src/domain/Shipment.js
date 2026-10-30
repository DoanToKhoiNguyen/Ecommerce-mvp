const { AppError } = require('./errors');

const STATUSES = ['PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
const TERMINAL = ['DELIVERED', 'CANCELLED'];

class Shipment {
    static isValidEvent(evt) {
        return !!evt && Number.isInteger(evt.oid) && Number.isInteger(evt.uid);
    }

    static validateStatus(status) {
        if (!STATUSES.includes(status))
            throw new AppError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }

    static assertCanChange(from, to) {
        if (TERMINAL.includes(from))
            throw new AppError(409, `Shipment is already ${from} and cannot be changed`);
    }
}
Shipment.STATUSES = STATUSES;
module.exports = Shipment;