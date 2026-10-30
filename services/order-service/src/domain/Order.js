const { AppError } = require('./errors');

const round2 = (n) => Math.round(n * 100) / 100;

class Order {
    static validateItems(items) {
        if (!Array.isArray(items) || items.length === 0)
            throw new AppError(400, 'items must be a non-empty array');
        if (items.length > 50) throw new AppError(400, 'too many items (max 50)');
        for (const i of items) {
            if (!i || !Number.isInteger(i.pid) || i.pid <= 0 || !Number.isInteger(i.qty) || i.qty <= 0)
                throw new AppError(400, 'each item needs integer pid > 0 and qty > 0');
        }
    }

    // discount là phần trăm
    static totals(discount, items) {
        const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
        const discount_amount = round2((subtotal * discount) / 100);
        return { discount_amount, total_amount: round2(subtotal - discount_amount) };
    }
}
module.exports = Order;