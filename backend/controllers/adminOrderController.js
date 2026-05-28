const orderDao = require("../models/dao/orderDao");
const couponDao = require("../models/dao/couponDao");

const NORMAL_STATUSES = [
    "em_processamento",
    "em_transito",
    "entregue",
];

const EXCHANGE_STATUSES = [
    "em_troca",
    "troca_autorizada",
    "troca_concluida",
];

const ALL_STATUSES = [...NORMAL_STATUSES, ...EXCHANGE_STATUSES];

exports.getAllOrders = async function (req, res) {
    try {
        const { status } = req.query;
        const orders = await orderDao.getAllOrders(status || null);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Erro ao buscar pedidos (admin):", error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
};

exports.getOrderById = async function (req, res) {
    try {
        const order = await orderDao.getOrderByIdAdmin(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        let coupons = await orderDao.getOrderCoupons(order.id);

        if (coupons.length === 0 && order.coupon_id) {
            const legacy = await couponDao.findById(order.coupon_id);
            if (legacy) {
                coupons = [{
                    coupon_id: legacy.id,
                    coupon_code: legacy.code,
                    coupon_type: legacy.type,
                    applied_value: Number(legacy.value),
                }];
            }
        }

        order.coupons_used = coupons;

        res.status(200).json(order);
    } catch (error) {
        console.error("Erro ao buscar pedido (admin):", error);
        res.status(500).json({ error: "Erro ao buscar pedido" });
    }
};

exports.updateOrderStatus = async function (req, res) {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status é obrigatório" });
        }

        if (!ALL_STATUSES.includes(status)) {
            return res.status(400).json({
                error: "Status inválido",
                valid: ALL_STATUSES,
            });
        }

        const order = await orderDao.getOrderByIdAdmin(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        const currentStatus = order.status;

        if (currentStatus === "troca_concluida") {
            return res.status(400).json({
                error: "Troca já foi concluída. Não é possível alterar o status.",
            });
        }

        const isInExchangeFlow = EXCHANGE_STATUSES.includes(currentStatus);

        if (isInExchangeFlow && !EXCHANGE_STATUSES.includes(status)) {
            return res.status(400).json({
                error: "Pedido em fluxo de troca. Status permitidos: Em troca, Troca autorizada, Troca concluída",
            });
        }

        if (!isInExchangeFlow && EXCHANGE_STATUSES.includes(status)) {
            return res.status(400).json({
                error: "Apenas o cliente pode solicitar a troca de um pedido entregue",
            });
        }

        const updated = await orderDao.updateDeliveryStatus(req.params.id, status);

        let generatedCoupon = null;

        if (status === "troca_concluida") {
            const exchangeItems = await orderDao.getExchangeItems(order.id);
            let couponValue = 0;
            for (const ei of exchangeItems) {
                couponValue += Number(ei.price) * Number(ei.quantity);
            }
            couponValue = Math.round(couponValue * 100) / 100;

            if (couponValue > 0) {
                generatedCoupon = await couponDao.createExchangeCoupon(
                    order.user_id,
                    order.id,
                    couponValue,
                );
            }
        }

        const response = {
            message: "Status atualizado com sucesso",
            order: updated,
        };

        if (generatedCoupon) {
            response.coupon = generatedCoupon;
            response.message = `Troca concluída! Cupom de troca gerado: ${generatedCoupon.code} (R$ ${Number(generatedCoupon.value).toFixed(2)})`;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Erro ao atualizar status do pedido (admin):", error);
        res.status(500).json({ error: "Erro ao atualizar status do pedido" });
    }
};
