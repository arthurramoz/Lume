const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/coupons", authMiddleware, couponController.getCoupons);
router.post("/coupons/validate", authMiddleware, couponController.validateCoupon);

module.exports = router;
