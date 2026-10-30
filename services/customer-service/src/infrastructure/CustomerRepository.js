const { pool } = require('./db');

class CustomerRepository {
    async createIfAbsent({ uid, fullname }) {
        // Idempotent: nhận cùng event 2 lần cũng không tạo trùng
        await pool.query(
            'INSERT INTO customers(uid, fullname, mid) VALUES($1,$2,1) ON CONFLICT (uid) DO NOTHING',
            [uid, fullname]
        );
    }

    async findWithMembership(uid) {
        const { rows } = await pool.query(
            `SELECT c.uid, c.fullname, c.mid, m.mname, m.score
       FROM customers c JOIN memberships m ON m.mid = c.mid
       WHERE c.uid = $1`,
            [uid]
        );
        return rows[0] || null;
    }

    async membershipExists(mid) {
        const { rows } = await pool.query('SELECT 1 FROM memberships WHERE mid = $1', [mid]);
        return rows.length > 0;
    }

    async update(uid, { fullname, mid }) {
        await pool.query(
            `UPDATE customers
       SET fullname = COALESCE($2, fullname), mid = COALESCE($3, mid)
       WHERE uid = $1`,
            [uid, fullname ?? null, mid ?? null]
        );
    }
}
module.exports = CustomerRepository;