const express = require('express');
const { migrate } = require('./infrastructure/db');
const OrderRepository = require('./infrastructure/OrderRepository');
const clients = require('./infrastructure/grpcClients');
const outbox = require('./infrastructure/OutboxPublisher');
const PlaceOrder = require('./application/PlaceOrder');
const GetOrder = require('./application/GetOrder');
const orderRoutes = require('./interfaces/orderRoutes');

const orderRepo = new OrderRepository();
const placeOrder = new PlaceOrder({ orderRepo, clients });
const getOrder = new GetOrder({ orderRepo });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'order-service' }));
app.use('/api/orders', orderRoutes({ placeOrder, getOrder }));

app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

(async () => {
    await migrate();
    outbox.start();
    const port = process.env.PORT || 3004;
    app.listen(port, () => console.log(`[order] listening on ${port}`));
})();