const pool = require("../../config/database");

class BookDao {
    async findAll() {
        const query = "SELECT * FROM books";
        const { rows } = await pool.query(query);
        return rows;
    }

    async findBooksCards() {
        const query = `SELECT 
            books.title, 
            books.price, 
            books.cover_image,
            authors.name AS author_name, 
            books.stock_quantity 
            FROM books INNER JOIN authors ON books.author_id = authors.id;`;
        const { rows } = await pool.query(query);
        return rows;
    }
}

module.exports = new BookDao();
