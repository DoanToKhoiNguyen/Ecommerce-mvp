const express = require('express');
const mongoose = require('mongoose');
const ShipmentRepository = require('./infrastructure/ShipmentRepository');
const consumer = require('./infrastructure/orderCreatedConsumer');
const CreateShipment = require('./application/CreateShipment');
const GetShipment = require('./application/GetShipment');
const UpdateShipmentStatus = require('./application/UpdateShipmentStatus');
const shipmentRoutes = require('./interfaces/shipmentRoutes');

const shipmentRepo = new ShipmentRepository();
const createShipment = new CreateShipment({ shipmentRepo });
const getShipment = new GetShipment({ shipmentRepo });
const updateStatus = new UpdateShipmentStatus({ shipmentRepo });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'shipment-service' }));
app.use('/api/shipments', shipmentRoutes({ getShipment, updateStatus }));

app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await shipmentRepo.init();
    console.log('[shipment] mongo connected');
    consumer.start(createShipment).catch((e) => console.error('[shipment] consumer stopped:', e));
    const port = process.env.PORT || 3005;
    app.listen(port, () => console.log(`[shipment] listening on ${port}`));
})();