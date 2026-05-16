const couponDao = require("../models/dao/couponDao");

exports.getAllCoupons = async function (req, res) {
    try {
        const { status, type } = req.query;
        const coupons = await couponDao.findAllAdmin(type || null, status || null);
        res.status(200).json(coupons);
    } catch (error) {
        console.error("Erro ao buscar cupons (admin):", error);
        res.status(500).json({ error: "Erro ao buscar cupons" });
    }
};

exports.toggleCoupon = async function (req, res) {
    try {
        const coupon = await couponDao.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }

        const updated = await couponDao.toggleActive(req.params.id);

        res.status(200).json({
            message: updated.is_used ? "Cupom desativado com sucesso" : "Cupom ativado com sucesso",
            coupon: updated,
        });
    } catch (error) {
        console.error("Erro ao alternar status do cupom:", error);
        res.status(500).json({ error: "Erro ao alternar status do cupom" });
    }
};
