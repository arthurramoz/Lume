const express = require("express");
const router = express.Router();
const adminOrderController = require("../controllers/adminOrderController");
const { authMiddleware } = require("../middlewares/authMiddleware");

function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
}

router.get("/admin/orders",            authMiddleware, adminOnly, adminOrderController.getAllOrders);
router.get("/admin/orders/:id",        authMiddleware, adminOnly, adminOrderController.getOrderById);
router.patch("/admin/orders/:id/status", authMiddleware, adminOnly, adminOrderController.updateOrderStatus);

module.exports = router;
