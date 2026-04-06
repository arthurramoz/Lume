const pool = require("../../config/database");

class BookDao {
    async findAll() {
        const query = "SELECT * FROM books";
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = "SELECT * FROM books WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findBooksCards() {
        const query = `
            SELECT 
                books.id,
                books.title, 
                books.price, 
                books.cover_image,
                authors.name AS author_name, 
                books.stock_quantity 
            FROM books 
            INNER JOIN authors ON books.author_id = authors.id
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new BookDao();
