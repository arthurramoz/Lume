const couponDao = require("../models/dao/couponDao");

// Busca todos os cupons
exports.getCoupons = async function (req, res) {
    try {
        const coupons = await couponDao.findAll();
        res.status(200).json(coupons);
    } catch (error) {
        console.error("Erro ao buscar cupons:", error);
        res.status(500).json({ error: "Erro ao buscar cupons" });
    }
};

// Valida se um cupom pode ser usado
exports.validateCoupon = async function (req, res) {
    try {
        const code = req.body.code;

        // Verifica se o código foi enviado
        if (!code) {
            return res.status(400).json({ error: "Código do cupom é obrigatório" });
        }

        // Busca o cupom pelo código
        const coupon = await couponDao.findByCode(code);

        // Se não encontrou, retorna erro
        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }

        // Verifica se o cupom já foi usado
        if (coupon.is_used) {
            return res.status(400).json({ error: "Cupom já foi utilizado" });
        }

        // Verifica se o cupom tem data de expiração e se já expirou
        if (coupon.expires_at) {
            const dataExpiracao = new Date(coupon.expires_at);
            const dataAtual = new Date();

            if (dataExpiracao < dataAtual) {
                return res.status(400).json({ error: "Cupom expirado" });
            }
        }

        // Se passou em todas as validações, o cupom é válido
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
