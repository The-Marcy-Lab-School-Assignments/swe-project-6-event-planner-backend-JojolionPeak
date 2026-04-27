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
const pool = new Pool(devConfig);
module.exports = pool;
