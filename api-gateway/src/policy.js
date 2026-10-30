const CUSTOMER_ADMIN = ['CUSTOMER', 'ADMIN'];
const ANY = ['CUSTOMER', 'ADMIN', 'SHIPMENT_STAFF'];

module.exports = [
    // Public
    { method: 'POST', path: /^\/api\/auth\/(register|login)$/, public: true },

    // Customer & Membership
    { method: 'GET', path: /^\/api\/customers\/\d+$/, roles: CUSTOMER_ADMIN },
    { method: 'GET', path: /^\/api\/customers\/\d+\/membership$/, roles: CUSTOMER_ADMIN },
    { method: 'PUT', path: /^\/api\/customers\/\d+$/, roles: CUSTOMER_ADMIN },

    // Product Catalog
    { method: 'GET', path: /^\/api\/products(\/\d+)?$/, roles: ANY },
    { method: 'POST', path: /^\/api\/products$/, roles: ['ADMIN'] },
    { method: 'PUT', path: /^\/api\/products\/\d+$/, roles: ['ADMIN'] },
    { method: 'DELETE', path: /^\/api\/products\/\d+$/, roles: ['ADMIN'] },

    // Order Management
    { method: 'POST', path: /^\/api\/orders$/, roles: ['CUSTOMER'] },
    { method: 'GET', path: /^\/api\/orders(\/\d+)?$/, roles: CUSTOMER_ADMIN },

    // Shipment
    { method: 'GET', path: /^\/api\/shipments$/, roles: ANY },
    { method: 'GET', path: /^\/api\/shipments\/[\w-]+$/, roles: ANY },
    { method: 'PATCH', path: /^\/api\/shipments\/[\w-]+\/status$/, roles: ['SHIPMENT_STAFF', 'ADMIN'] },
];
