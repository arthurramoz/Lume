const pool = require("../../config/database");
const crypto = require("crypto");

class CouponDao {
    async findAll() {
        const query = "SELECT * FROM coupons ORDER BY id DESC";
        const result = await pool.query(query);
        return result.rows;
    }

    async findByCode(code) {
        const query = "SELECT * FROM coupons WHERE code = $1";
        const result = await pool.query(query, [code]);
        return result.rows[0];
    }

    async findById(id) {
        const query = "SELECT * FROM coupons WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findByUserId(user_id) {
        const query = "SELECT * FROM coupons WHERE user_id = $1 ORDER BY id DESC";
        const result = await pool.query(query, [user_id]);
        return result.rows;
    }

    async markAsUsed(id) {
        const query = "UPDATE coupons SET is_used = true WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async hasUserUsedCoupon(coupon_id, user_id) {
        const query = "SELECT id FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2";
        const result = await pool.query(query, [coupon_id, user_id]);
        return result.rows.length > 0;
    }

    async registerUsage(coupon_id, user_id) {
        const query = "INSERT INTO coupon_usages (coupon_id, user_id) VALUES ($1, $2) RETURNING *";
        const result = await pool.query(query, [coupon_id, user_id]);
        return result.rows[0];
    }

    generateCode() {
        return "TROCA-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    }

    async createExchangeCoupon(user_id, order_id, value) {
        const code = this.generateCode();
        const expires_at = new Date();
        expires_at.setMonth(expires_at.getMonth() + 3);

        const query = `
            INSERT INTO coupons (code, type, value, is_used, expires_at, user_id, order_id)
            VALUES ($1, 'troca', $2, false, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [code, value, expires_at, user_id, order_id]);
        return result.rows[0];
    }

    async findAllAdmin(type = null, status = null) {
        let query = `
            SELECT c.*,
                   u.full_name AS user_name,
                   u.email AS user_email,
                   COUNT(cu.id) AS usage_count
            FROM coupons c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN coupon_usages cu ON cu.coupon_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            params.push(type);
            query += ` AND c.type = $${params.length}`;
        }

        if (status === "ativo") {
            query += ` AND c.is_used = false AND (c.expires_at IS NULL OR c.expires_at > NOW())`;
        } else if (status === "inativo") {
            query += ` AND (c.is_used = true OR (c.expires_at IS NOT NULL AND c.expires_at <= NOW()))`;
        }

        query += " GROUP BY c.id, u.full_name, u.email ORDER BY c.id DESC";

        const result = await pool.query(query, params);
        return result.rows;
    }

    async toggleActive(id) {
        const query = "UPDATE coupons SET is_used = NOT is_used WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new CouponDao();
