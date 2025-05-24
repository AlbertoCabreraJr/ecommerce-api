const { Pool } = require("pg");
console.log("process.env.DB_PASSWORD",process.env.DB_PASSWORD)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true'
});

const connect = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to database', error);
    process.exit(1);
  }
}

module.exports.connectDB = connect;
module.exports.db = pool;