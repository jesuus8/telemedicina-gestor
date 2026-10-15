const { Pool } = require("pg");

const conexion = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = conexion;
