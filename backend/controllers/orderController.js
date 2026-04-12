const orderDao = require("../models/dao/orderDao");
const cartDao = require("../models/dao/cartDao");
const couponDao = require("../models/dao/couponDao");
const shippingDao = require("../models/dao/shippingDao");
const addressDao = require("../models/dao/addressDao");

exports.createOrder = async function (req, res) {
    try {
        const user_id = req.user.id;
        const address_id = req.body.address_id;
        const cardsPayment = req.body.cards;
        const body_coupon_id = req.body.coupon_id;
        const coupon_code = req.body.coupon_code;
        const body_freight = req.body.freight;

        if (!address_id) {
            return res.status(400).json({ error: "Endereço é obrigatório" });
        }

        if (!cardsPayment || cardsPayment.length === 0) {
            return res
                .status(400)
                .json({ error: "Pelo menos um cartão é obrigatório" });
        }

        if (cardsPayment.length > 2) {
            return res
                .status(400)
                .json({ error: "É permitido pagar com no máximo 2 cartões" });
        }

        const cart = await cartDao.findCartByUserId(user_id);
        if (!cart) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        const items = await cartDao.getCartItems(cart.id);
        if (items.length === 0) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        let subtotal = 0;
        for (let i = 0; i < items.length; i++) {
            const preco = Number(items[i].price);
            const quantidade = Number(items[i].quantity);
            subtotal = subtotal + preco * quantidade;
        }

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

            if (coupon.expires_at) {
                const dataExpiracao = new Date(coupon.expires_at);
                const dataAtual = new Date();

                if (dataExpiracao < dataAtual) {
                    return res.status(400).json({ error: "Cupom expirado" });
                }
            }

            coupon_id = coupon.id;
            discount = Number(coupon.value);
        }

        let freight = 0;
        const address = await addressDao.findById(address_id);
        if (address && address.state) {
            const shippingRate = await shippingDao.findByState(address.state);
            if (shippingRate) {
                freight = Number(shippingRate.rate);
            }
        }

        let total_amount = subtotal + freight - discount;
        if (total_amount < 0) {
            total_amount = 0;
        }

        let somaCartoes = 0;
        for (let j = 0; j < cardsPayment.length; j++) {
            const cardAmount = Number(cardsPayment[j].amount);

            if (!cardsPayment[j].card_id) {
                return res
                    .status(400)
                    .json({ error: "Selecione um cartão em todas as linhas" });
            }

            if (cardAmount <= 0) {
                return res
                    .status(400)
                    .json({
                        error: "O valor de cada cartão deve ser maior que R$ 0,00",
                    });
            }

            if (cardAmount < 10) {
                if (!coupon) {
                    return res.status(400).json({
                        error: "O valor mínimo por cartão é R$ 10,00",
                    });
                }
                if (total_amount >= 10 * cardsPayment.length) {
                    return res.status(400).json({
                        error: "O valor mínimo por cartão é R$ 10,00",
                    });
                }
            }

            somaCartoes = somaCartoes + cardAmount;
        }

        somaCartoes = Math.round(somaCartoes * 100) / 100;
        total_amount = Math.round(total_amount * 100) / 100;

        if (somaCartoes !== total_amount) {
            return res.status(400).json({
                error:
                    "A soma dos valores dos cartões (R$ " +
                    somaCartoes.toFixed(2) +
                    ") deve ser igual ao total do pedido (R$ " +
                    total_amount.toFixed(2) +
                    ")",
            });
        }

        const order = await orderDao.createOrder(
            user_id,
            address_id,
            coupon_id,
            total_amount,
            freight,
        );

        for (let k = 0; k < items.length; k++) {
            const item = items[k];
            await orderDao.createOrderItem(
                order.id,
                item.book_id,
                item.quantity,
                Number(item.price),
            );
        }

        for (let m = 0; m < cardsPayment.length; m++) {
            await orderDao.createPayment(
                order.id,
                Number(cardsPayment[m].card_id),
                Number(cardsPayment[m].amount),
            );
        }

        await orderDao.updateOrderStatus(order.id, "em_processamento");

        await orderDao.clearCart(user_id);

        if (coupon) {
            await couponDao.markAsUsed(coupon.id);
        }

        res.status(201).json({
            message: "Pedido realizado com sucesso!",
            order_id: order.id,
            total: total_amount,
            freight: freight,
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

exports.getOrders = async function (req, res) {
    try {
        const orders = await orderDao.getOrdersByUserId(req.user.id);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
};

exports.getOrderById = async function (req, res) {
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

exports.requestExchange = async function (req, res) {
    try {
        const reason = req.body.reason;

        const order = await orderDao.getOrderById(req.params.id, req.user.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        if (order.status !== "entregue") {
            return res.status(400).json({
                error: "Só é possível solicitar troca de pedidos entregues",
            });
        }

        if (!reason) {
            return res
                .status(400)
                .json({ error: "Motivo da troca é obrigatório" });
        }

        if (reason.trim().length === 0) {
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
