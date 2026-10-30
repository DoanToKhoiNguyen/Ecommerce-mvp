const mongoose = require('mongoose');

const Product = mongoose.model('Product', new mongoose.Schema({
    pid: { type: Number, unique: true, required: true },
    pname: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { versionKey: false }));

const Counter = mongoose.model('Counter', new mongoose.Schema({
    _id: String,
    seq: { type: Number, default: 0 },
}, { versionKey: false }));

const PUBLIC = { _id: 0, pid: 1, pname: 1, price: 1, quantity: 1 };

class ProductRepository {
    async nextPid() {
        const c = await Counter.findOneAndUpdate(
            { _id: 'pid' }, { $inc: { seq: 1 } }, { new: true, upsert: true }
        );
        return c.seq;
    }

    count() { return Product.countDocuments(); }
    findAll() { return Product.find({}, PUBLIC).sort({ pid: 1 }).lean(); }
    findByPid(pid) { return Product.findOne({ pid }, PUBLIC).lean(); }

    async create(data) {
        const d = await Product.create(data);
        return { pid: d.pid, pname: d.pname, price: d.price, quantity: d.quantity };
    }

    update(pid, fields) {
        return Product.findOneAndUpdate({ pid }, { $set: fields }, { new: true, projection: PUBLIC }).lean();
    }

    async delete(pid) {
        const r = await Product.deleteOne({ pid });
        return r.deletedCount > 0;
    }

    // Nguyên tử: chỉ trừ khi đủ hàng, trả về null nếu không khớp
    decrementIfEnough(pid, qty) {
        return Product.findOneAndUpdate(
            { pid, quantity: { $gte: qty } },
            { $inc: { quantity: -qty } },
            { new: true, projection: PUBLIC }
        ).lean();
    }

    increment(pid, qty) {
        return Product.updateOne({ pid }, { $inc: { quantity: qty } });
    }
}
module.exports = ProductRepository;