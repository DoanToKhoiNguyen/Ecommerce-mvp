const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function migrate() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      roleid   SERIAL PRIMARY KEY,
      rolename VARCHAR(50) UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      uid      SERIAL PRIMARY KEY,
      username VARCHAR(50)  UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email    VARCHAR(100) UNIQUE,
      phone    VARCHAR(20),
      roleid   INT NOT NULL REFERENCES roles(roleid)
    );
  `);

    for (const r of ['ADMIN', 'CUSTOMER', 'SHIPMENT_STAFF']) {
        await pool.query('INSERT INTO roles(rolename) VALUES($1) ON CONFLICT DO NOTHING', [r]);
    }

    const seeds = [
        { username: 'admin', password: 'Admin@123', role: 'ADMIN' },
        { username: 'staff', password: 'Staff@123', role: 'SHIPMENT_STAFF' },
    ];
    for (const s of seeds) {
        const hash = await bcrypt.hash(s.password, 10);
        await pool.query(
            `INSERT INTO users(username, password, roleid)
       SELECT $1, $2, roleid FROM roles WHERE rolename = $3
       ON CONFLICT (username) DO NOTHING`,
            [s.username, hash, s.role]
        );
    }
    console.log('[auth] migration + seed done');
}

module.exports = { pool, migrate };