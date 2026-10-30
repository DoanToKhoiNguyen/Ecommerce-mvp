const { AppError } = require('../domain/errors');

const hidden = ({ uid, ...rest }) => rest; // không trả uid ra ngoài

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