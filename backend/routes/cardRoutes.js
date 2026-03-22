const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

router.post("/cards", cardController.createCard);
router.get("/cards", cardController.getCards);
router.delete("/cards/:id", cardController.deleteCard);

module.exports = router;
