const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');

const PROTO = process.env.PROTO_PATH || '/app/proto/product.proto';
const CODES = {
    400: grpc.status.INVALID_ARGUMENT,
    404: grpc.status.NOT_FOUND,
    409: grpc.status.FAILED_PRECONDITION,
};

function start(reserveStock) {
    const def = loader.loadSync(PROTO, { keepCase: true, defaults: true });
    const pkg = grpc.loadPackageDefinition(def).product;

    const server = new grpc.Server();
    server.addService(pkg.ProductService.service, {
        ReserveStock: async (call, callback) => {
            try {
                callback(null, await reserveStock.execute(call.request.items));
            } catch (e) {
                if (!e.status) console.error(e);
                callback({ code: CODES[e.status] || grpc.status.INTERNAL, message: e.message });
            }
        },
    });

    const addr = `0.0.0.0:${process.env.GRPC_PORT || 50053}`;
    server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
        if (err) return console.error('[product] grpc bind failed:', err);
        console.log(`[product] gRPC listening on ${addr}`);
    });
}
module.exports = { start };