require("dotenv").config();
const pool = require("./config/database");

// Apenas para forçar o teste de conexão ao rodar o arquivo
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Erro ao conectar:", err);
    } else {
        console.log(
            "Banco de dados respondendo. Data/Hora do Servidor:",
            res.rows[0].now,
        );
    }
});

console.log("Servidor Back-end iniciando...");
