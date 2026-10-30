const Order = require('../domain/Order');
const DiscountPolicy = require('../domain/DiscountPolicy');

class PlaceOrder {
    constructor({ orderRepo, clients }) {
        Object.assign(this, { orderRepo, clients });
    }

    async execute({ uid, items }) {
        Order.validateItems(items);

        // Bước 3, 4: lấy Customer + điểm thành viên (404 nếu không có Customer)
        const customer = await this.clients.getCustomer(uid);

        // Bước 6, 7: kiểm tra và trừ kho, nhận lại giá hiện tại (404/409 nếu lỗi)
        const reserved = await this.clients.reserveStock(items.map(({ pid, qty }) => ({ pid, qty })));
        const lines = reserved.items.map(({ pid, qty, unit_price }) => ({ pid, qty, unit_price }));

        // Bước 5: tính discount từ score
        const discount = DiscountPolicy.percentFor(customer.score);
        const totals = Order.totals(discount, lines);

        // Bước 8: transaction Order + OrderDetail + OutboxEvent
        let oid;
        try {
            oid = await this.orderRepo.createWithOutbox({
                uid, discount, items: lines,
                toEvent: (id) => ({
                    oid: id, uid, discount, items: lines, ...totals, createdAt: new Date().toISOString(),
                }),
            });
        } catch (e) {
            console.error('[order] DB failed AFTER stock was reserved (needs compensation):', e.message);
            throw e;
        }

        return { oid, uid, discount, items: lines, ...totals };
    }
}
module.exports = PlaceOrder;