const pool = require("../../config/database");

class DashboardDao {
    async findSalesByGenre(startDate, endDate) {
        const query = `
            SELECT
                TO_CHAR(o.created_at, 'YYYY-MM') AS month_key,
                TO_CHAR(o.created_at, 'Mon/YYYY') AS month_label,
                g.name AS genre_name,
                COALESCE(SUM(oi.quantity), 0) AS total_quantity
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN books b ON oi.book_id = b.id
            JOIN genres g ON b.genre_id = g.id
            WHERE o.created_at >= $1::date
              AND o.created_at < ($2::date + INTERVAL '1 day')
              AND o.status NOT IN ('aguardando_pagamento')
            GROUP BY month_key, month_label, g.name
            ORDER BY month_key ASC, g.name ASC
        `;

        const result = await pool.query(query, [startDate, endDate]);
        return result.rows;
    }
}

module.exports = new DashboardDao();
