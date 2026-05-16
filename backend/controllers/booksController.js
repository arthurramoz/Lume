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
