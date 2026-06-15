const pool = require("../../config/database");

class ChatbotDao {
    async getUserPurchaseHistory(userId) {
        const query = `
            SELECT DISTINCT
                b.title,
                a.name AS author_name,
                g.name AS genre_name
            FROM orders o
            INNER JOIN order_items oi ON oi.order_id = o.id
            INNER JOIN books b ON oi.book_id = b.id
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN genres g ON b.genre_id = g.id
            WHERE o.user_id = $1
              AND o.status NOT IN ('cancelado')
            ORDER BY b.title
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async getAvailableBooks() {
        const query = `
            SELECT
                b.title,
                b.price,
                b.stock_quantity,
                a.name AS author_name,
                g.name AS genre_name
            FROM books b
            LEFT JOIN authors a ON b.author_id = a.id
            LEFT JOIN genres g ON b.genre_id = g.id
            WHERE b.stock_quantity > 0
            ORDER BY b.title
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new ChatbotDao();
