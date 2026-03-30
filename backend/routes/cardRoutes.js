const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/cards", authMiddleware, cardController.createCard);
router.get("/cards", authMiddleware, cardController.getCards);
router.delete("/cards/:id", authMiddleware, cardController.deleteCard);

module.exports = router;
