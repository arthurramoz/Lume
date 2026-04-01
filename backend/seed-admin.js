const bcrypt = require("bcryptjs");
const pool = require("./config/database");

async function seedAdmin() {
    try {
        const email = "admin@lume.com";
        const password = "12345678";

        const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (check.rows.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
        INSERT INTO users (full_name, email, password_hash, gender, phone_type, phone_ddd, phone_number, cpf, birth_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
        `;

        await pool.query(query, [
            "Administrador Lume",
            email,
            password_hash,
            "N/A", "Celular", "11", "900000000", "00000000000", "1990-01-01"
        ]);

        console.log("Admin user seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err);
        process.exit(1);
    }
}

seedAdmin();
