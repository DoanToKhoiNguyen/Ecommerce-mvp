const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'customer-service',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(registerCustomer) {
    const consumer = kafka.consumer({ groupId: 'customer-service' });

    for (; ;) {                       // thử lại cho tới khi Kafka và topic sẵn sàng
        try {
            await consumer.connect();
            await consumer.subscribe({ topic: 'user-registered', fromBeginning: true });
            break;
        } catch (e) {
            console.error('[customer] kafka not ready, retry in 3s:', e.message);
            await sleep(3000);
        }
    }

    await consumer.run({
        eachMessage: async ({ message }) => {
            let evt;
            try { evt = JSON.parse(message.value.toString()); }
            catch { return console.error('[customer] invalid event payload, skipped'); }
            if (!evt.uid) return console.error('[customer] event missing uid, skipped');

            await registerCustomer.execute(evt);
            console.log(`[customer] created customer uid=${evt.uid}`);
        },
    });
    console.log('[customer] consuming topic user-registered');
}
module.exports = { start };