const { Kafka } = require('kafkajs');
const { pool } = require('./db');

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
});
const producer = kafka.producer();
let connected = false;
let busy = false;

async function tick() {
    if (busy) return;
    busy = true;
    try {
        if (!connected) { await producer.connect(); connected = true; console.log('[order] kafka producer connected'); }

        const { rows } = await pool.query(
            `SELECT id, topic, event_key, payload FROM outbox_events
       WHERE published_at IS NULL ORDER BY id LIMIT 50`
        );
        for (const r of rows) {
            await producer.send({
                topic: r.topic,
                messages: [{ key: r.event_key, value: JSON.stringify(r.payload) }],
            });
            await pool.query('UPDATE outbox_events SET published_at = now() WHERE id = $1', [r.id]);
            console.log(`[order] published ${r.topic} key=${r.event_key} (outbox id=${r.id})`);
        }
    } catch (e) {
        connected = false; // lần quét sau sẽ thử kết nối lại, event vẫn còn nguyên trong outbox
        console.error('[order] outbox publish failed, will retry:', e.message);
    } finally {
        busy = false;
    }
}

function start() { setInterval(tick, 1000); }
module.exports = { start };