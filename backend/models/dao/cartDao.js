const pool = require("../../config/database");

class CartDao {
    async findCartByUserId(user_id) {
        const query = "SELECT * FROM carts WHERE user_id = $1 AND status = 'aberto'";
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    }

    async createCart(user_id) {
        const query = "INSERT INTO carts (user_id) VALUES ($1) RETURNING *";
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    }

    async findItemInCart(cart_id, book_id) {
        const query = "SELECT * FROM cart_items WHERE cart_id = $1 AND book_id = $2";
        const result = await pool.query(query, [cart_id, book_id]);
        return result.rows[0];
    }

    async findCartItemById(item_id) {
        const query = "SELECT * FROM cart_items WHERE id = $1";
        const result = await pool.query(query, [item_id]);
        return result.rows[0];
    }

    async createCartItem(cart_id, book_id, quantity) {
        const query = `
            INSERT INTO cart_items (cart_id, book_id, quantity) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(query, [cart_id, book_id, quantity]);
        return result.rows[0];
    }

    async updateItemQuantity(item_id, added_quantity) {
        const query = `
            UPDATE cart_items 
            SET quantity = quantity + $1 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await pool.query(query, [added_quantity, item_id]);
        return result.rows[0];
    }

    async getCartItems(cart_id) {
        const query = `
            SELECT 
                ci.id,
                ci.cart_id,
                ci.book_id,
                ci.quantity,
                b.title,
                b.price,
                b.cover_image,
                a.name AS author_name
            FROM cart_items ci
            INNER JOIN books b ON ci.book_id = b.id
            LEFT JOIN authors a ON b.author_id = a.id
            WHERE ci.cart_id = $1
        `;
        const result = await pool.query(query, [cart_id]);
        return result.rows;
    }

    async deleteCartItem(item_id) {
        const query = "DELETE FROM cart_items WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [item_id]);
        return result.rows[0];
    }

    async updateCartItem(item_id, quantity) {
        const query = "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *";
        const result = await pool.query(query, [quantity, item_id]);
        return result.rows[0];
    }
}

module.exports = new CartDao();
