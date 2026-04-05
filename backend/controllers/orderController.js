const orderDao = require("../models/dao/orderDao");
const cartDao = require("../models/dao/cartDao");
const couponDao = require("../models/dao/couponDao");

exports.createOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            address_id,
            card_id,
            coupon_id: body_coupon_id,
            coupon_code,
        } = req.body;

        if (!address_id || !card_id) {
            return res
                .status(400)
                .json({ error: "Endereço e cartão são obrigatórios" });
        }

        const cart = await cartDao.findCartByUserId(user_id);
        if (!cart) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        const items = await cartDao.getCartItems(cart.id);
        if (items.length === 0) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        let subtotal = items.reduce((sum, item) => {
            return sum + Number(item.price) * Number(item.quantity);
        }, 0);

        let coupon_id = null;
        let discount = 0;
        let coupon = null;

        if (body_coupon_id) {
            coupon = await couponDao.findById(body_coupon_id);
        } else if (coupon_code) {
            coupon = await couponDao.findByCode(coupon_code);
        }

        if (coupon) {
            if (coupon.is_used) {
                return res
                    .status(400)
                    .json({ error: "Cupom já foi utilizado" });
            }
            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return res.status(400).json({ error: "Cupom expirado" });
            }
            coupon_id = coupon.id;
            discount = Number(coupon.value);
        }

        const total_amount = Math.max(0, subtotal - discount);
        const order = await orderDao.createOrder(
            user_id,
            address_id,
            coupon_id,
            total_amount,
        );

        for (const item of items) {
            await orderDao.createOrderItem(
                order.id,
                item.book_id,
                item.quantity,
                Number(item.price),
            );
        }

        await orderDao.createPayment(order.id);
        await orderDao.updateOrderStatus(order.id, "em_processamento");
        await orderDao.clearCart(user_id);

        if (coupon) {
            await couponDao.markAsUsed(coupon.id);
        }

        res.status(201).json({
            message: "Pedido realizado com sucesso!",
            order_id: order.id,
            total: total_amount,
            status: "em_processamento",
        });
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({
            error: "Erro ao criar pedido",
            details: error.message,
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await orderDao.getOrdersByUserId(req.user.id);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await orderDao.getOrderById(req.params.id, req.user.id);
        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        res.status(500).json({ error: "Erro ao buscar pedido" });
    }
};

exports.requestExchange = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await orderDao.getOrderById(req.params.id, req.user.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        if (order.status !== "entregue") {
            return res.status(400).json({
                error: "Só é possível solicitar troca de pedidos entregues",
            });
        }

        if (!reason || reason.trim().length === 0) {
            return res
                .status(400)
                .json({ error: "Motivo da troca é obrigatório" });
        }

        const updated = await orderDao.updateOrderStatus(order.id, "em_troca");
        res.status(200).json({
            message: "Troca solicitada com sucesso",
            order: updated,
        });
    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        res.status(500).json({ error: "Erro ao solicitar troca" });
    }
};
