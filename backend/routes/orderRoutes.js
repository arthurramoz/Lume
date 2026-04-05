const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/orders", authMiddleware, orderController.createOrder);
router.get("/orders", authMiddleware, orderController.getOrders);
router.get("/orders/:id", authMiddleware, orderController.getOrderById);
router.put("/orders/:id/exchange", authMiddleware, orderController.requestExchange);

module.exports = router;
