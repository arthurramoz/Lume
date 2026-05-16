const express = require("express");
const router = express.Router();
const adminCouponController = require("../controllers/adminCouponController");
const { authMiddleware } = require("../middlewares/authMiddleware");

function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
}

router.get("/admin/coupons", authMiddleware, adminOnly, adminCouponController.getAllCoupons);
router.patch("/admin/coupons/:id/toggle", authMiddleware, adminOnly, adminCouponController.toggleCoupon);

module.exports = router;
