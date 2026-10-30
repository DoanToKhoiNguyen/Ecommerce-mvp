const express = require('express');
const { migrate } = require('./infrastructure/db');
const CustomerRepository = require('./infrastructure/CustomerRepository');
const grpcServer = require('./infrastructure/grpcServer');
const consumer = require('./infrastructure/userRegisteredConsumer');
const RegisterCustomer = require('./application/RegisterCustomer');
const GetCustomer = require('./application/GetCustomer');
const UpdateCustomer = require('./application/UpdateCustomer');
const customerRoutes = require('./interfaces/customerRoutes');

const customerRepo = new CustomerRepository();
const registerCustomer = new RegisterCustomer({ customerRepo });
const getCustomer = new GetCustomer({ customerRepo });
const updateCustomer = new UpdateCustomer({ customerRepo });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'customer-service' }));
app.use('/api/customers', customerRoutes({ getCustomer, updateCustomer }));

app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

(async () => {
    await migrate();
    grpcServer.start(getCustomer);
    consumer.start(registerCustomer).catch((e) => console.error('[customer] consumer stopped:', e));
    const port = process.env.PORT || 3002;
    app.listen(port, () => console.log(`[customer] listening on ${port}`));
})();