const { AppError } = require('../domain/errors');
const { toVN } = require('../domain/time');

const hidden = ({ uid, history, ...rest }) => ({
    ...rest,
    // dữ liệu cũ (kiểu Date) vẫn được đổi sang giờ VN, dữ liệu mới là chuỗi sẵn
    history: (history || []).map((h) => ({
        status: h.status,
        at: typeof h.at === 'string' ? h.at : toVN(h.at),
    })),
});

class GetShipment {
    constructor({ shipmentRepo }) { this.shipmentRepo = shipmentRepo; }

    async byId({ shipid, uid, isCustomer }) {
        const s = await this.shipmentRepo.findByShipid(shipid);
        if (!s) throw new AppError(404, 'Shipment not found');
        if (isCustomer && s.uid !== uid) throw new AppError(403, 'Forbidden');
        return hidden(s);
    }

    async byOid({ oid, uid, isCustomer }) {
        const rows = await this.shipmentRepo.findByOid(oid, isCustomer ? uid : undefined);
        return { items: rows.map(hidden) };
    }
}
module.exports = GetShipment;