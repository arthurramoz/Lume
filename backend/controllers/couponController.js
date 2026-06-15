const couponDao = require("../models/dao/couponDao");

exports.getCoupons = async function (req, res) {
    try {
        const user_id = req.user ? req.user.id : null;
        const coupons = await couponDao.findAll();

        // Filtra cupons de troca: exibe apenas os do próprio usuário.
        // Cupons promocionais são globais e aparecem para todos.
        const filtered = coupons.filter((c) => {
            if (c.type === "troca") {
                return c.user_id === user_id;
            }
            return true;
        });

        if (user_id) {
            const result = await Promise.all(
                filtered.map(async (c) => {
                    const used = await couponDao.hasUserUsedCoupon(c.id, user_id);
                    return { ...c, user_has_used: used };
                })
            );
            return res.status(200).json(result);
        }

        res.status(200).json(filtered);
    } catch (error) {
        console.error("Erro ao buscar cupons:", error);
        res.status(500).json({ error: "Erro ao buscar cupons" });
    }
};

exports.validateCoupon = async function (req, res) {
    try {
        const code = req.body.code;
        const user_id = req.user.id;

        if (!code) {
            return res.status(400).json({ error: "Código do cupom é obrigatório" });
        }

        const coupon = await couponDao.findByCode(code);

        if (!coupon) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }

        if (coupon.type === "promocional") {
            if (coupon.is_used) {
                return res.status(400).json({ error: "Cupom desativado pelo administrador" });
            }

            const alreadyUsed = await couponDao.hasUserUsedCoupon(coupon.id, user_id);
            if (alreadyUsed) {
                return res.status(400).json({ error: "Você já utilizou este cupom" });
            }
        } else {
            if (coupon.is_used) {
                return res.status(400).json({ error: "Cupom já foi utilizado" });
            }
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

exports.getMyCoupons = async function (req, res) {
    try {
        const user_id = req.user.id;
        const allCoupons = await couponDao.findByUserId(user_id);

        const available = allCoupons.filter((c) => {
            if (c.is_used) return false;
            if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
            return true;
        });

        res.status(200).json(available);
    } catch (error) {
        console.error("Erro ao buscar meus cupons:", error);
        res.status(500).json({ error: "Erro ao buscar cupons" });
    }
};
