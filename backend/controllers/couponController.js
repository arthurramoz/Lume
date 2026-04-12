const couponDao = require("../models/dao/couponDao");

exports.getCoupons = async function (req, res) {
    try {
        const coupons = await couponDao.findAll();
        res.status(200).json(coupons);
    } catch (error) {
        console.error("Erro ao buscar cupons:", error);
        res.status(500).json({ error: "Erro ao buscar cupons" });
    }
};

exports.validateCoupon = async function (req, res) {
    try {
        const code = req.body.code;

        if (!code) {
            return res.status(400).json({ error: "Código do cupom é obrigatório" });
        }

        const coupon = await couponDao.findByCode(code);

        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }

        if (coupon.is_used) {
            return res.status(400).json({ error: "Cupom já foi utilizado" });
        }

        if (coupon.expires_at) {
            const dataExpiracao = new Date(coupon.expires_at);
            const dataAtual = new Date();

            if (dataExpiracao < dataAtual) {
                return res.status(400).json({ error: "Cupom expirado" });
            }
        }

        res.status(200).json({
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            discount: Number(coupon.value),
        });
    } catch (error) {
        console.error("Erro ao validar cupom:", error);
        res.status(500).json({ error: "Erro ao validar cupom" });
    }
};
