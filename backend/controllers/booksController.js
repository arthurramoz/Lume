const booksDao = require("../models/dao/booksDao");

exports.getBooks = async function (req, res) {
    try {
        const books = await booksDao.findAll();
        return res.status(200).json(books);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return res.status(500).json({ error: "Erro ao buscar livros" });
    }
};

exports.getFindBooksCards = async function (req, res) {
    try {
        const books = await booksDao.findBooksCards();
        return res.status(200).json(books);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return res.status(500).json({ error: "Erro ao buscar livros" });
    }
};

exports.getBookById = async function (req, res) {
    try {
        const book = await booksDao.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: "Livro não encontrado" });
        }
        return res.status(200).json(book);
    } catch (error) {
        console.error("Erro ao buscar livro por ID:", error);
        return res.status(500).json({ error: "Erro ao buscar livro por ID" });
    }
};

exports.searchBooks = async function (req, res) {
    try {
        const {
            search,
            authors,   // comma-separated IDs: "1,6,12"
            genres,    // comma-separated IDs: "13,17"
            sort,      // "price_asc", "price_desc", "title_asc"
            page,
            limit
        } = req.query;

        const authorIds = authors ? authors.split(",").map(Number).filter(n => !isNaN(n)) : [];
        const genreIds = genres ? genres.split(",").map(Number).filter(n => !isNaN(n)) : [];

        const result = await booksDao.searchBooks({
            search: search || "",
            authorIds,
            genreIds,
            sort: sort || "",
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 6
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return res.status(500).json({ error: "Erro ao buscar livros" });
    }
};

exports.getAuthors = async function (req, res) {
    try {
        const authors = await booksDao.findAllAuthors();
        return res.status(200).json(authors);
    } catch (error) {
        console.error("Erro ao buscar autores:", error);
        return res.status(500).json({ error: "Erro ao buscar autores" });
    }
};

exports.getGenres = async function (req, res) {
    try {
        const genres = await booksDao.findAllGenres();
        return res.status(200).json(genres);
    } catch (error) {
        console.error("Erro ao buscar gêneros:", error);
        return res.status(500).json({ error: "Erro ao buscar gêneros" });
    }
};
