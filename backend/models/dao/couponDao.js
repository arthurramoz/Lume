const pool = require("../../config/database");

class CouponDao {
    async findAll() {
        const query = `SELECT * FROM coupons ORDER BY id DESC`;
        const result = await pool.query(query);
        return result.rows;
    }

    async findByUserId(user_id) {
        const query = `SELECT * FROM coupons WHERE user_id = $1 ORDER BY id DESC`;
        const result = await pool.query(query, [user_id]);
        return result.rows;
    }

    async findByCode(code) {
        const query = `SELECT * FROM coupons WHERE code = $1`;
        const result = await pool.query(query, [code]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `SELECT * FROM coupons WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async markAsUsed(id) {
        const query = `UPDATE coupons SET is_used = true WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new CouponDao();
