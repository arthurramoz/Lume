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

    async findByEmail(email) {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    async update(id, data) {
        const user = await this.findById(id);
        if (!user) return null;

        const name = data.full_name !== undefined ? data.full_name : user.full_name;
        const email = data.email !== undefined ? data.email : user.email;
        const gender = data.gender !== undefined ? data.gender : user.gender;
        const birthDate = data.birth_date !== undefined ? data.birth_date : user.birth_date;
        const cpf = data.cpf !== undefined ? data.cpf : user.cpf;
        const phoneType = data.phone_type !== undefined ? data.phone_type : user.phone_type;
        const phoneDdd = data.phone_ddd !== undefined ? data.phone_ddd : user.phone_ddd;
        const phoneNumber = data.phone_number !== undefined ? data.phone_number : user.phone_number;

        const query = `
            UPDATE users 
            SET full_name = $1, email = $2, gender = $3, birth_date = $4, 
                cpf = $5, phone_type = $6, phone_ddd = $7, phone_number = $8
            WHERE id = $9 
            RETURNING *
        `;

        const values = [name, email, gender, birthDate, cpf, phoneType, phoneDdd, phoneNumber, id];
        const result = await pool.query(query, values);
        const updated = result.rows[0];

        if (updated) {
            delete updated.password_hash;
        }

        return updated;
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
