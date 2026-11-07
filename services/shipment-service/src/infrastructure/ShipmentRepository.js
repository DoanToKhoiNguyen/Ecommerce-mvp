const mongoose = require('mongoose');
const { toVN } = require('../domain/time');

const Shipment = mongoose.model('Shipment', new mongoose.Schema({
    shipid: { type: Number, unique: true, required: true },
    oid: { type: Number, unique: true, required: true },   // unique: chặn tạo trùng
    uid: { type: Number, required: true },
    status: { type: String, required: true },
    history: [{ _id: false, status: String, at: String }],   // tracking
}, { versionKey: false }));

const Counter = mongoose.model('ShipmentCounter', new mongoose.Schema({
    _id: String,
    seq: { type: Number, default: 0 },
}, { versionKey: false }));

const PUBLIC = { _id: 0, shipid: 1, oid: 1, uid: 1, status: 1, history: 1 };

class ShipmentRepository {
    init() { return Shipment.init(); } // đảm bảo unique index đã được tạo

    async nextShipid() {
        const c = await Counter.findOneAndUpdate(
            { _id: 'shipid' }, { $inc: { seq: 1 } }, { new: true, upsert: true }
        );
        return 5000 + c.seq; // shipid đầu tiên = 5001
    }

    // Trả về null nếu oid đã có Shipment
    async createIfAbsent({ oid, uid }) {
        if (await Shipment.exists({ oid })) return null;
        const shipid = await this.nextShipid();
        try {
            const d = await Shipment.create({
                shipid, oid, uid, status: 'PENDING',
                history: [{ status: 'PENDING', at: toVN() }],
            });
            return { shipid: d.shipid, oid: d.oid, status: d.status };
        } catch (e) {
            if (e.code === 11000) return null; // hai event đến cùng lúc, bên kia đã tạo
            throw e;
        }
    }

    findByShipid(shipid) { return Shipment.findOne({ shipid }, PUBLIC).lean(); }
    findByOid(oid, uid) {
        const filter = uid === undefined ? { oid } : { oid, uid };
        return Shipment.find(filter, PUBLIC).lean();
    }

    updateStatus(shipid, status) {
        return Shipment.findOneAndUpdate(
            { shipid },
            { $set: { status }, $push: { history: { status, at: toVN() } } },
            { new: true, projection: PUBLIC }
        ).lean();
    }
}
module.exports = ShipmentRepository;