const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("Conexão com o PostgreSQL estabelecida com sucesso! 🚀");
});

pool.on("error", (err) => {
    console.error("Erro inesperado no PostgreSQL:", err);
    process.exit(-1);
});

module.exports = pool;
