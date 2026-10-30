const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'shipment-service',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(createShipment) {
    const consumer = kafka.consumer({ groupId: 'shipment-service' });

    for (; ;) { // thử lại cho tới khi Kafka sẵn sàng
        try {
            await consumer.connect();
            await consumer.subscribe({ topic: 'order-created', fromBeginning: true });
            break;
        } catch (e) {
            console.error('[shipment] kafka not ready, retry in 3s:', e.message);
            await sleep(3000);
        }
    }

    await consumer.run({
        eachMessage: async ({ partition, message }) => {
            let evt;
            try { evt = JSON.parse(message.value.toString()); }
            catch { return console.error('[shipment] invalid JSON, skipped'); }

            const r = await createShipment.execute(evt);
            if (r.created)
                console.log(`[shipment] created shipid=${r.shipment.shipid} for oid=${evt.oid} (PENDING)`);
            else
                console.error(`[shipment] skipped (p${partition} offset ${message.offset}): ${r.reason}`);
        },
    });
    console.log('[shipment] consuming topic order-created');
}
module.exports = { start };