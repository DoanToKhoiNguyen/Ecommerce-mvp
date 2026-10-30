const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');

const PROTO = process.env.PROTO_PATH || '/app/proto/customer.proto';

function start(getCustomer) {
    const def = loader.loadSync(PROTO, { keepCase: true, defaults: true });
    const pkg = grpc.loadPackageDefinition(def).customer;

    const server = new grpc.Server();
    server.addService(pkg.CustomerService.service, {
        GetCustomerWithMembership: async (call, callback) => {
            try {
                callback(null, await getCustomer.execute(call.request.uid));
            } catch (e) {
                callback({
                    code: e.status === 404 ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
                    message: e.message,
                });
            }
        },
    });

    const addr = `0.0.0.0:${process.env.GRPC_PORT || 50052}`;
    server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err) => {
        if (err) return console.error('[customer] grpc bind failed:', err);
        console.log(`[customer] gRPC listening on ${addr}`);
    });
}
module.exports = { start };