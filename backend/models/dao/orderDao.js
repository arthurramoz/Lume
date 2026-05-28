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

    async createOrderCoupon(order_id, coupon_id, applied_value, coupon_code, coupon_type) {
        const query = `
            INSERT INTO order_coupons (order_id, coupon_id, applied_value, coupon_code, coupon_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [order_id, coupon_id, applied_value, coupon_code, coupon_type]);
        return result.rows[0];
    }

    async getOrderCoupons(order_id) {
        const query = "SELECT * FROM order_coupons WHERE order_id = $1";
        const result = await pool.query(query, [order_id]);
        return result.rows;
    }

    async updateOrderStatus(order_id, status) {
        const query = "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *";
        const result = await pool.query(query, [status, order_id]);
        return result.rows[0];
    }

    async requestExchange(order_id, items) {
        await pool.query(
            "UPDATE orders SET status = 'em_troca' WHERE id = $1",
            [order_id]
        );

        for (const item of items) {
            await pool.query(
                `INSERT INTO exchange_items (order_id, order_item_id, reason)
                 VALUES ($1, $2, $3)`,
                [order_id, item.order_item_id, item.reason]
            );
        }

        const result = await pool.query("SELECT * FROM orders WHERE id = $1", [order_id]);
        return result.rows[0];
    }

    async getExchangeItems(order_id) {
        try {
            const query = `
                SELECT
                    ei.id,
                    ei.order_item_id,
                    ei.reason,
                    ei.created_at,
                    oi.quantity,
                    oi.price,
                    b.title,
                    b.cover_image,
                    a.name AS author_name
                FROM exchange_items ei
                JOIN order_items oi ON ei.order_item_id = oi.id
                JOIN books b ON oi.book_id = b.id
                LEFT JOIN authors a ON b.author_id = a.id
                WHERE ei.order_id = $1
                ORDER BY ei.created_at ASC
            `;
            const result = await pool.query(query, [order_id]);
            return result.rows;
        } catch (err) {
            return [];
        }
    }

    async ensureExchangeItemsTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exchange_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                order_item_id INTEGER NOT NULL REFERENCES order_items(id),
                reason TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
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
        const order = result.rows[0];

        if (order) {
            const exchangeItems = await this.getExchangeItems(order_id);
            order.exchange_items = exchangeItems;
        }

        return order;
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

    async getAllOrders(status = null) {
        let query = `
            SELECT
                o.id,
                o.total_amount,
                o.freight,
                o.status,
                o.created_at,
                o.user_id,
                u.full_name AS client_name,
                u.email    AS client_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
        `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` WHERE o.status = $${params.length}`;
        }

        query += " ORDER BY o.created_at DESC";

        const result = await pool.query(query, params);
        return result.rows;
    }

    async getOrderByIdAdmin(order_id) {
        const query = `
            SELECT
                o.id,
                o.user_id,
                o.address_id,
                o.coupon_id,
                o.total_amount,
                o.freight,
                o.status,
                o.created_at,
                u.full_name  AS client_name,
                u.email      AS client_email,
                u.cpf        AS client_cpf,
                u.phone_ddd  AS client_phone_ddd,
                u.phone_number AS client_phone_number,
                addr.street_type, addr.street_name, addr.street_number, addr.neighborhood,
                json_agg(json_build_object(
                    'id',           oi.id,
                    'book_id',      oi.book_id,
                    'quantity',     oi.quantity,
                    'price',        oi.price,
                    'title',        b.title,
                    'cover_image',  b.cover_image,
                    'author_name',  a.name
                )) AS items
            FROM orders o
            LEFT JOIN users   u    ON o.user_id    = u.id
            LEFT JOIN addresses addr ON o.address_id = addr.id
            LEFT JOIN order_items oi  ON oi.order_id  = o.id
            LEFT JOIN books b         ON oi.book_id   = b.id
            LEFT JOIN authors a        ON b.author_id  = a.id
            WHERE o.id = $1
            GROUP BY o.id, u.full_name, u.email, u.cpf, u.phone_ddd, u.phone_number,
                     addr.street_type, addr.street_name, addr.street_number, addr.neighborhood
        `;
        const result = await pool.query(query, [order_id]);
        const order = result.rows[0];

        if (order) {
            const exchangeItems = await this.getExchangeItems(order_id);
            order.exchange_items = exchangeItems;
        }

        return order;
    }

    async updateDeliveryStatus(order_id, status) {
        const query = `
            UPDATE orders
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, order_id]);
        return result.rows[0];
    }
}

module.exports = new OrderDao();
