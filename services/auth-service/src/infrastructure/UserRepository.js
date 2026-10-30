const { pool } = require('./db');

class UserRepository {
    async existsByUsernameOrEmail(username, email) {
        const { rows } = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 OR ($2::text IS NOT NULL AND email = $2) LIMIT 1',
            [username, email || null]
        );
        return rows.length > 0;
    }

    async create({ username, passwordHash, email, phone, roleName }) {
        const { rows } = await pool.query(
            `INSERT INTO users(username, password, email, phone, roleid)
       SELECT $1, $2, $3, $4, roleid FROM roles WHERE rolename = $5
       RETURNING uid`,
            [username, passwordHash, email || null, phone || null, roleName]
        );
        return rows[0].uid;
    }

    async findByUsername(username) {
        const { rows } = await pool.query(
            `SELECT u.uid, u.username, u.password, r.rolename AS role
       FROM users u JOIN roles r ON r.roleid = u.roleid
       WHERE u.username = $1`,
            [username]
        );
        return rows[0] || null;
    }
}
module.exports = UserRepository;