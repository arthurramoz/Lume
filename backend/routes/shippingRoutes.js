const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shippingController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/shipping/:address_id", authMiddleware, shippingController.getShippingByAddress);
router.get("/shipping", authMiddleware, shippingController.getAllRates);

module.exports = router;
