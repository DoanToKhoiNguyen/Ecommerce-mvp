const Shipment = require('../domain/Shipment');

class CreateShipment {
    constructor({ shipmentRepo }) { this.shipmentRepo = shipmentRepo; }

    // Trả về { created, reason }
    async execute(evt) {
        if (!Shipment.isValidEvent(evt)) return { created: false, reason: 'invalid event (missing oid/uid)' };

        const s = await this.shipmentRepo.createIfAbsent({ oid: evt.oid, uid: evt.uid });
        return s
            ? { created: true, shipment: s }
            : { created: false, reason: `shipment for oid=${evt.oid} already exists` };
    }
}
module.exports = CreateShipment;