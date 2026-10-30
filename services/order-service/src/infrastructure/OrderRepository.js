const { pool } = require('./db');

const toItem = (d) => ({ pid: d.pid, qty: d.qty, unit_price: Number(d.unit_price) });

class OrderRepository {
    // Một transaction duy nhất: Order + OrderDetail + OutboxEvent (bước 8 của sơ đồ luồng)
    async createWithOutbox({ uid, discount, items, toEvent }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                'INSERT INTO orders(uid, discount) VALUES($1, $2) RETURNING oid',
                [uid, discount]
            );
            const oid = rows[0].oid;

            for (const i of items) {
                await client.query(
                    'INSERT INTO order_details(oid, pid, qty, unit_price) VALUES($1,$2,$3,$4)',
                    [oid, i.pid, i.qty, i.unit_price]
                );
            }

            await client.query(
                'INSERT INTO outbox_events(topic, event_key, payload) VALUES($1,$2,$3)',
                ['order-created', String(oid), JSON.stringify(toEvent(oid))]
            );

            await client.query('COMMIT');
            return oid;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async findById(oid) {
        const o = await pool.query('SELECT oid, uid, discount FROM orders WHERE oid = $1', [oid]);
        if (!o.rows[0]) return null;
        const d = await pool.query(
            'SELECT pid, qty, unit_price FROM order_details WHERE oid = $1 ORDER BY pid', [oid]
        );
        return { ...o.rows[0], discount: Number(o.rows[0].discount), items: d.rows.map(toItem) };
    }

    async findByUid(uid) {
        const { rows } = await pool.query(
            'SELECT oid, uid, discount FROM orders WHERE uid = $1 ORDER BY oid DESC', [uid]
        );
        return rows.map((r) => ({ ...r, discount: Number(r.discount) }));
    }

    async findAll() {
        const { rows } = await pool.query('SELECT oid, uid, discount FROM orders ORDER BY oid DESC');
        return rows.map((r) => ({ ...r, discount: Number(r.discount) }));
    }
}
module.exports = OrderRepository;