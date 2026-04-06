const pool = require("../../config/database");

class OrderDao {
    async createOrder(user_id, address_id, coupon_id, total_amount, freight) {
        const query = `
            INSERT INTO orders (user_id, address_id, coupon_id, total_amount, freight, status)
            VALUES ($1, $2, $3, $4, $5, 'aguardando_pagamento')
            RETURNING *
        `;
        const result = await pool.query(query, [user_id, address_id, coupon_id, total_amount, freight || 0]);
        return result.rows[0];
    }

    async createOrderItem(order_id, book_id, quantity, price) {
        const query = `
            INSERT INTO order_items (order_id, book_id, quantity, price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [order_id, book_id, quantity, price]);
        return result.rows[0];
    }

    async createPayment(order_id, card_id, amount) {
        const query = `
            INSERT INTO payments (order_id, card_id, amount, payment_method, payment_status)
            VALUES ($1, $2, $3, 'cartao', 'aprovado')
            RETURNING *
        `;
        const result = await pool.query(query, [order_id, card_id, amount]);
        return result.rows[0];
    }

    async updateOrderStatus(order_id, status) {
        const query = "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *";
        const result = await pool.query(query, [status, order_id]);
        return result.rows[0];
    }

    async getOrdersByUserId(user_id) {
        const query = `
            SELECT
                o.id,
                o.total_amount,
                o.status,
                o.created_at,
                o.address_id,
                o.coupon_id
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `;
        const result = await pool.query(query, [user_id]);
        return result.rows;
    }

    async getOrderById(order_id, user_id) {
        const query = `
            SELECT o.*,
                addr.street_type, addr.street_name, addr.street_number, addr.neighborhood,
                json_agg(json_build_object(
                    'id', oi.id,
                    'book_id', oi.book_id,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'title', b.title,
                    'cover_image', b.cover_image,
                    'author_name', a.name
                )) AS items
            FROM orders o
            LEFT JOIN addresses addr ON o.address_id = addr.id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN books b ON oi.book_id = b.id
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE o.id = $1 AND o.user_id = $2
            GROUP BY o.id, addr.street_type, addr.street_name, addr.street_number, addr.neighborhood
        `;
        const result = await pool.query(query, [order_id, user_id]);
        return result.rows[0];
    }

    async clearCart(user_id) {
        const cartQuery = "SELECT id FROM carts WHERE user_id = $1 AND status = 'aberto'";
        const cartResult = await pool.query(cartQuery, [user_id]);

        if (cartResult.rows.length === 0) {
            return;
        }

        const cart_id = cartResult.rows[0].id;

        await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cart_id]);

        await pool.query("UPDATE carts SET status = 'finalizado' WHERE id = $1", [cart_id]);
    }
}

module.exports = new OrderDao();
