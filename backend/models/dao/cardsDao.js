const pool = require("../../config/database");

class CardDao {
    async create(card) {
        const query = `
            INSERT INTO credit_cards(
                user_id, card_number, printed_name, card_flag, security_code, expiration_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            card.user_id,
            card.card_number,
            card.printed_name,
            card.card_flag,
            card.security_code,
            card.expiration_date,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll() {
        const query = "SELECT * FROM credit_cards";
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = "SELECT * FROM credit_cards WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = "DELETE FROM credit_cards WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new CardDao();
