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
    CREATE SEQUENCE IF NOT EXISTS order_oid_seq START 1001;

    CREATE TABLE IF NOT EXISTS orders (
      oid        INT PRIMARY KEY DEFAULT nextval('order_oid_seq'),
      uid        INT NOT NULL,                       -- tham chiếu logic tới Customer (khác DB)
      discount   DECIMAL(10,2) NOT NULL DEFAULT 0,   -- phần trăm giảm giá
      created_at TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
    );

    CREATE TABLE IF NOT EXISTS order_details (
      oid        INT NOT NULL REFERENCES orders(oid),
      pid        INT NOT NULL,                       -- tham chiếu logic tới Product (khác DB)
      qty        INT NOT NULL CHECK (qty > 0),
      unit_price DECIMAL(10,2) NOT NULL,
      PRIMARY KEY (oid, pid)
    );

    CREATE TABLE IF NOT EXISTS outbox_events (
      id           BIGSERIAL PRIMARY KEY,
      topic        VARCHAR(100) NOT NULL,
      event_key    VARCHAR(100) NOT NULL,
      payload      JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
      published_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(id) WHERE published_at IS NULL;
  `);
  console.log('[order] migration done');
}

module.exports = { pool, migrate };