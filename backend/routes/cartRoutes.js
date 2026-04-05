const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/cart", authMiddleware, cartController.createCart);
router.get("/cart", authMiddleware, cartController.getCartItems);
router.get("/cart/count", authMiddleware, cartController.getCartCount);
router.delete("/cart/:id", authMiddleware, cartController.deleteCartItem);
router.put("/cart/:id", authMiddleware, cartController.updateCartItem);

module.exports = router;
