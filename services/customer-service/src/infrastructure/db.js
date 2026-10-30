const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function migrate() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS memberships (
      mid   SERIAL PRIMARY KEY,
      mname VARCHAR(50) UNIQUE NOT NULL,
      score INT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS customers (
      uid      INT PRIMARY KEY,                 -- tham chiếu logic tới User bên Auth (không có FK liên DB)
      fullname VARCHAR(100) NOT NULL,
      mid      INT NOT NULL DEFAULT 1 REFERENCES memberships(mid)
    );
  `);
    const tiers = [['Bronze', 0], ['Silver', 100], ['Gold', 500], ['Platinum', 1000]];
    for (const [mname, score] of tiers) {
        await pool.query(
            'INSERT INTO memberships(mname, score) VALUES($1,$2) ON CONFLICT (mname) DO NOTHING',
            [mname, score]
        );
    }
    console.log('[customer] migration + seed done');
}

module.exports = { pool, migrate };