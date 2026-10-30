const { AppError } = require('../domain/errors');

class ReserveStock {
    constructor({ productRepo }) { this.productRepo = productRepo; }

    async execute(items) {
        if (!Array.isArray(items) || items.length === 0)
            throw new AppError(400, 'items must not be empty');

        // Gộp pid trùng, kiểm tra dữ liệu
        const wanted = new Map();
        for (const { pid, qty } of items) {
            if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty <= 0)
                throw new AppError(400, 'each item needs integer pid and qty > 0');
            wanted.set(pid, (wanted.get(pid) || 0) + qty);
        }

        const done = [];
        const priced = [];
        for (const [pid, qty] of wanted) {
            const doc = await this.productRepo.decrementIfEnough(pid, qty);
            if (!doc) {
                // All-or-nothing: hoàn lại những món đã trừ
                for (const d of done) await this.productRepo.increment(d.pid, d.qty);
                const exists = await this.productRepo.findByPid(pid);
                throw exists
                    ? new AppError(409, `Insufficient stock for product ${pid}`)
                    : new AppError(404, `Product ${pid} not found`);
            }
            done.push({ pid, qty });
            priced.push({ pid, qty, unit_price: doc.price });
        }
        return { items: priced };
    }
}
module.exports = ReserveStock;