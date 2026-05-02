require("dotenv").config();
const { Pool } = require("pg");

// 2. Replace hard-coded values with `process.env`
const devConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
};

const prodConfig = {
  connectionString: process.env.PG_CONNECTION_STRING,
};

const pool = new Pool(
  process.env.PG_CONNECTION_STRING ? prodConfig : devConfig
);

module.exports = pool;
