const pool = require("../../config/database");

class BookDao {
    async findAll() {
        const query = "SELECT * FROM books";
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = `
            SELECT 
                books.*,
                authors.name AS author_name
            FROM books 
            INNER JOIN authors ON books.author_id = authors.id
            WHERE books.id = $1
        `;
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

    /**
     * Busca livros com filtros, busca textual, ordenação e paginação.
     * @param {Object} params
     * @param {string}   params.search    - Texto para buscar em título, autor ou gênero
     * @param {number[]} params.authorIds - IDs de autores para filtrar
     * @param {number[]} params.genreIds  - IDs de gêneros para filtrar
     * @param {string}   params.sort      - Ordenação: 'price_asc', 'price_desc', 'title_asc'
     * @param {number}   params.page      - Página atual (1-indexed)
     * @param {number}   params.limit     - Itens por página
     */
    async searchBooks({ search, authorIds, genreIds, sort, page = 1, limit = 6 }) {
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        // Busca textual em título, autor ou gênero
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            conditions.push(`(
                books.title ILIKE $${paramIndex}
                OR authors.name ILIKE $${paramIndex}
                OR genres.name ILIKE $${paramIndex}
            )`);
            values.push(searchTerm);
            paramIndex++;
        }

        // Filtro por autores
        if (authorIds && authorIds.length > 0) {
            conditions.push(`books.author_id = ANY($${paramIndex}::int[])`);
            values.push(authorIds);
            paramIndex++;
        }

        // Filtro por gêneros
        if (genreIds && genreIds.length > 0) {
            conditions.push(`books.genre_id = ANY($${paramIndex}::int[])`);
            values.push(genreIds);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Ordenação
        let orderClause = "ORDER BY books.id ASC";
        if (sort === "price_asc") orderClause = "ORDER BY books.price ASC";
        else if (sort === "price_desc") orderClause = "ORDER BY books.price DESC";
        else if (sort === "title_asc") orderClause = "ORDER BY books.title ASC";

        // Query de contagem total
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM books
            INNER JOIN authors ON books.author_id = authors.id
            INNER JOIN genres ON books.genre_id = genres.id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total);

        // Query de dados com paginação
        const offset = (page - 1) * limit;
        const dataQuery = `
            SELECT 
                books.id,
                books.title, 
                books.price, 
                books.cover_image,
                books.stock_quantity,
                authors.name AS author_name,
                genres.name AS genre_name
            FROM books 
            INNER JOIN authors ON books.author_id = authors.id
            INNER JOIN genres ON books.genre_id = genres.id
            ${whereClause}
            ${orderClause}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        values.push(limit, offset);

        const dataResult = await pool.query(dataQuery, values);

        return {
            books: dataResult.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findAllAuthors() {
        const query = `
            SELECT DISTINCT authors.id, authors.name
            FROM authors
            INNER JOIN books ON books.author_id = authors.id
            ORDER BY authors.name ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async findAllGenres() {
        const query = `
            SELECT DISTINCT genres.id, genres.name
            FROM genres
            INNER JOIN books ON books.genre_id = genres.id
            ORDER BY genres.name ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = new BookDao();
