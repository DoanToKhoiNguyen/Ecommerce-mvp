const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const { AppError } = require('../domain/errors');

const opts = { keepCase: true, defaults: true };
const load = (file, pkg) =>
    grpc.loadPackageDefinition(loader.loadSync(`/app/proto/${file}`, opts))[pkg];

const customerClient = new (load('customer.proto', 'customer').CustomerService)(
    process.env.CUSTOMER_GRPC, grpc.credentials.createInsecure()
);
const productClient = new (load('product.proto', 'product').ProductService)(
    process.env.PRODUCT_GRPC, grpc.credentials.createInsecure()
);

const HTTP = {
    [grpc.status.INVALID_ARGUMENT]: 400,
    [grpc.status.NOT_FOUND]: 404,
    [grpc.status.FAILED_PRECONDITION]: 409,
};

function unary(client, method, request) {
    return new Promise((resolve, reject) => {
        client[method](request, { deadline: Date.now() + 5000 }, (err, res) => {
            if (!err) return resolve(res);
            const status = HTTP[err.code];
            if (status) return reject(new AppError(status, err.details || err.message));
            console.error(`[order] gRPC ${method} failed:`, err.message);
            reject(new AppError(503, 'Upstream service unavailable'));
        });
    });
}

module.exports = {
    getCustomer: (uid) => unary(customerClient, 'GetCustomerWithMembership', { uid }),
    reserveStock: (items) => unary(productClient, 'ReserveStock', { items }),
};