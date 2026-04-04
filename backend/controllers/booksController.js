const booksDao = require("../models/dao/booksDao");

exports.getBooks = async (req, res) => {
    try {
        const books = await booksDao.findAll();
        return res.status(200).json(books);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return res.status(500).json({ error: "Erro ao buscar livros" });
    }
};

exports.getFindBooksCards = async (req, res) => {
    try {
        const books = await booksDao.findBooksCards();
        return res.status(200).json(books);
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return res.status(500).json({ error: "Erro ao buscar livros" });
    }
};
