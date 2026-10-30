const Shipment = require('../domain/Shipment');
const { AppError } = require('../domain/errors');

class UpdateShipmentStatus {
    constructor({ shipmentRepo }) { this.shipmentRepo = shipmentRepo; }

    async execute({ shipid, status }) {
        Shipment.validateStatus(status);

        const current = await this.shipmentRepo.findByShipid(shipid);
        if (!current) throw new AppError(404, 'Shipment not found');
        Shipment.assertCanChange(current.status, status);

        const s = await this.shipmentRepo.updateStatus(shipid, status);
        return { shipid: s.shipid, oid: s.oid, status: s.status };
    }
}
module.exports = UpdateShipmentStatus;