const pool = require("../../config/database");

class CartDao {
    // 1. Busca a caixa principal do usuário
    async findCartByUserId(user_id) {
        const query = `SELECT * FROM carts WHERE user_id = $1 AND status = 'aberto'`;
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    }

    // 2. Cria uma caixa nova
    async createCart(user_id) {
        const query = `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`;
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    }

    // 3. Busca se um livro específico já está dentro da caixa
    async findItemInCart(cart_id, book_id) {
        const query = `SELECT * FROM cart_items WHERE cart_id = $1 AND book_id = $2`;
        const result = await pool.query(query, [cart_id, book_id]);
        return result.rows[0];
    }

    // 4. Insere um livro novo na caixa
    async createCartItem(cart_id, book_id, quantity) {
        const query = `
            INSERT INTO cart_items (cart_id, book_id, quantity) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const result = await pool.query(query, [cart_id, book_id, quantity]);
        return result.rows[0];
    }

    // 5. ATUALIZA a quantidade de um livro que já estava lá
    async updateItemQuantity(item_id, added_quantity) {
        const query = `
            UPDATE cart_items 
            SET quantity = quantity + $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await pool.query(query, [added_quantity, item_id]);
        return result.rows[0];
    }
}
module.exports = new CartDao();
