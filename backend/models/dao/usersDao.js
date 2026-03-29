const pool = require("../../config/database");

class UserDao {
    async create(user) {
        const query = `
        INSERT INTO users (gender, full_name, birth_date, cpf, phone_type, phone_ddd, phone_number, email, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
        `;
        const values = [
            user.gender,
            user.full_name,
            user.birth_date,
            user.cpf,
            user.phone_type,
            user.phone_ddd,
            user.phone_number,
            user.email,
            user.password_hash,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll(search) {
        let result;
        if (search) {
            const query = `
                SELECT * FROM users 
                WHERE full_name ILIKE $1 
                   OR email ILIKE $1 
                   OR cpf ILIKE $1
            `;
            result = await pool.query(query, [`%${search}%`]);
        } else {
            const query = `SELECT * FROM users`;
            result = await pool.query(query);
        }

        return result.rows.map((user) => {
            delete user.password_hash;
            return user;
        });
    }

    async findById(id) {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);
        const user = result.rows[0];
        if (user) {
            delete user.password_hash;
        }
        return user;
    }

    async update(id, user) {
        const query =
            "UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING *";
        const result = await pool.query(query, [
            user.full_name,
            user.email,
            id,
        ]);
        return result.rows[0];
    }

    async updateStatus(id, status) {
        const query = "UPDATE users SET status = $1 WHERE id = $2 RETURNING *";
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM users WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new UserDao();
