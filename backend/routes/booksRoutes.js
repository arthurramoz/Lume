const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");

router.get("/books", booksController.getBooks);
router.get("/books/cards", booksController.getFindBooksCards);
router.get("/books/:id", booksController.getBookById);

module.exports = router;
