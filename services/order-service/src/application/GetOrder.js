const Order = require('../domain/Order');
const { AppError } = require('../domain/errors');

class GetOrder {
    constructor({ orderRepo }) { this.orderRepo = orderRepo; }

    async list({ uid, isAdmin }) {
        const rows = isAdmin ? await this.orderRepo.findAll() : await this.orderRepo.findByUid(uid);
        return { items: rows };
    }

    async get({ oid, uid, isAdmin }) {
        const order = await this.orderRepo.findById(oid);
        if (!order) throw new AppError(404, 'Order not found');
        if (!isAdmin && order.uid !== uid) throw new AppError(403, 'Forbidden');
        return { ...order, ...Order.totals(order.discount, order.items) };
    }
}
module.exports = GetOrder;