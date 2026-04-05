const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/cart", authMiddleware, cartController.createCart);

module.exports = router;
