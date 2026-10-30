const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
    retry: { retries: 10 },
});
const producer = kafka.producer();
let connected = false;

async function connect() {
    await producer.connect();
    connected = true;
    console.log('[auth] kafka producer connected');
}

async function publish(topic, key, payload) {
    if (!connected) await connect();
    await producer.send({ topic, messages: [{ key: String(key), value: JSON.stringify(payload) }] });
}

module.exports = { connect, publish };