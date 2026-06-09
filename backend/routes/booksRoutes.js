const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");

router.get("/books", booksController.getBooks);
router.get("/books/cards", booksController.getFindBooksCards);
router.get("/books/search", booksController.searchBooks);
router.get("/books/authors", booksController.getAuthors);
router.get("/books/genres", booksController.getGenres);
router.get("/books/:id", booksController.getBookById);

module.exports = router;
