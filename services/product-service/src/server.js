const express = require('express');
const mongoose = require('mongoose');
const ProductRepository = require('./infrastructure/ProductRepository');
const grpcServer = require('./infrastructure/grpcServer');
const ManageProduct = require('./application/ManageProduct');
const ReserveStock = require('./application/ReserveStock');
const productRoutes = require('./interfaces/productRoutes');

const productRepo = new ProductRepository();
const manageProduct = new ManageProduct({ productRepo });
const reserveStock = new ReserveStock({ productRepo });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'product-service' }));
app.use('/api/products', productRoutes({ manageProduct }));

app.use((err, req, res, next) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

async function seed() {
    if ((await productRepo.count()) > 0) return;
    const samples = [
        { pname: 'Laptop', price: 1500, quantity: 10 },
        { pname: 'Mouse', price: 25, quantity: 100 },
        { pname: 'Keyboard', price: 60, quantity: 50 },
    ];
    for (const s of samples) await productRepo.create({ pid: await productRepo.nextPid(), ...s });
    console.log('[product] seeded 3 products');
}

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[product] mongo connected');
    await seed();
    grpcServer.start(reserveStock);
    const port = process.env.PORT || 3003;
    app.listen(port, () => console.log(`[product] listening on ${port}`));
})();