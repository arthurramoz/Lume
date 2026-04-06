const pool = require("./config/database");

async function migratePayments() {
    try {
        // Verifica se a coluna card_id já existe
        var checkCardId = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'card_id'
        `);

        if (checkCardId.rows.length === 0) {
            await pool.query(`ALTER TABLE payments ADD COLUMN card_id INT REFERENCES credit_cards(id)`);
            console.log("Column 'card_id' added to payments.");
        } else {
            console.log("Column 'card_id' already exists.");
        }

        // Verifica se a coluna amount já existe
        var checkAmount = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'amount'
        `);

        if (checkAmount.rows.length === 0) {
            await pool.query(`ALTER TABLE payments ADD COLUMN amount DECIMAL(10,2)`);
            console.log("Column 'amount' added to payments.");
        } else {
            console.log("Column 'amount' already exists.");
        }

        console.log("\n✅ Payments migration completed!");
        process.exit(0);
    } catch (err) {
        console.error("Error in migration:", err);
        process.exit(1);
    }
}

migratePayments();
