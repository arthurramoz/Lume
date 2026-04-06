const pool = require("../../config/database");

class ShippingDao {
    async findByState(state) {
        const query = "SELECT * FROM shipping_rates WHERE state = $1";
        const result = await pool.query(query, [state.toUpperCase()]);
        return result.rows[0];
    }

    async findAll() {
        const query = "SELECT * FROM shipping_rates ORDER BY state";
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new ShippingDao();
