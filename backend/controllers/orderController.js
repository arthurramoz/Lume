const orderDao = require("../models/dao/orderDao");
const cartDao = require("../models/dao/cartDao");
const couponDao = require("../models/dao/couponDao");
const shippingDao = require("../models/dao/shippingDao");
const addressDao = require("../models/dao/addressDao");

exports.createOrder = async function (req, res) {
    try {
        const user_id = req.user.id;
        const address_id = req.body.address_id;
        const cardsPayment = req.body.cards || [];
        let coupon_ids = req.body.coupon_ids || [];

        if (coupon_ids.length === 0 && req.body.coupon_id) {
            coupon_ids = [req.body.coupon_id];
        }

        if (coupon_ids.length === 0 && req.body.coupon_code) {
            const found = await couponDao.findByCode(req.body.coupon_code);
            if (found) coupon_ids = [found.id];
        }

        if (!address_id) {
            return res.status(400).json({ error: "Endereço é obrigatório" });
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
            subtotal += Number(items[i].price) * Number(items[i].quantity);
        }

        let freight = 0;
        const address = await addressDao.findById(address_id);
        if (address && address.state) {
            const shippingRate = await shippingDao.findByState(address.state);
            if (shippingRate) {
                freight = Number(shippingRate.rate);
            }
        }

        const totalBeforeDiscount = subtotal + freight;

        let promoCount = 0;
        let totalDiscount = 0;
        let totalExchangeDiscount = 0;
        const validatedCoupons = [];

        for (let i = 0; i < coupon_ids.length; i++) {
            const coupon = await couponDao.findById(coupon_ids[i]);

            if (!coupon) {
                return res.status(400).json({ error: `Cupom ID ${coupon_ids[i]} não encontrado` });
            }

            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return res.status(400).json({ error: `Cupom "${coupon.code}" está expirado` });
            }

            if (coupon.type === "promocional") {
                promoCount++;

                if (promoCount > 1) {
                    return res.status(400).json({
                        error: "É permitido usar no máximo 1 cupom promocional por compra",
                    });
                }

                if (coupon.is_used) {
                    return res.status(400).json({ error: `Cupom "${coupon.code}" está desativado` });
                }

                const alreadyUsed = await couponDao.hasUserUsedCoupon(coupon.id, user_id);
                if (alreadyUsed) {
                    return res.status(400).json({ error: `Você já utilizou o cupom "${coupon.code}"` });
                }

                const promoDiscount = Math.min(Number(coupon.value), totalBeforeDiscount - totalDiscount);
                totalDiscount += promoDiscount;
                validatedCoupons.push({ ...coupon, appliedValue: promoDiscount });
            } else {
                if (coupon.is_used) {
                    return res.status(400).json({ error: `Cupom "${coupon.code}" já foi utilizado` });
                }

                if (coupon.user_id && coupon.user_id !== user_id) {
                    return res.status(400).json({ error: `Cupom "${coupon.code}" não pertence a você` });
                }

                totalExchangeDiscount += Number(coupon.value);
                totalDiscount += Number(coupon.value);
                validatedCoupons.push({ ...coupon, appliedValue: Number(coupon.value) });
            }
        }

        let total_amount = totalBeforeDiscount - totalDiscount;
        let changeCouponValue = 0;

        if (total_amount < 0) {
            changeCouponValue = Math.abs(total_amount);
            total_amount = 0;
        }

        total_amount = Math.round(total_amount * 100) / 100;
        changeCouponValue = Math.round(changeCouponValue * 100) / 100;

        if (total_amount === 0) {
            if (cardsPayment.length > 0) {
                const somaCartoes = cardsPayment.reduce((s, c) => s + Number(c.amount), 0);
                if (somaCartoes > 0) {
                    return res.status(400).json({
                        error: "Os cupons já cobrem 100% da compra. Não é necessário cartão.",
                    });
                }
            }
        } else {
            if (!cardsPayment || cardsPayment.length === 0) {
                return res.status(400).json({ error: "Pelo menos um cartão é obrigatório" });
            }

            if (cardsPayment.length > 2) {
                return res.status(400).json({ error: "É permitido pagar com no máximo 2 cartões" });
            }

            let somaCartoes = 0;
            for (let j = 0; j < cardsPayment.length; j++) {
                const cardAmount = Number(cardsPayment[j].amount);

                if (!cardsPayment[j].card_id) {
                    return res.status(400).json({ error: "Selecione um cartão em todas as linhas" });
                }

                if (cardAmount <= 0) {
                    return res.status(400).json({ error: "O valor de cada cartão deve ser maior que R$ 0,00" });
                }

                if (cardAmount < 10 && total_amount >= 10 * cardsPayment.length) {
                    return res.status(400).json({ error: "O valor mínimo por cartão é R$ 10,00" });
                }

                somaCartoes += cardAmount;
            }

            somaCartoes = Math.round(somaCartoes * 100) / 100;

            if (somaCartoes !== total_amount) {
                return res.status(400).json({
                    error: `A soma dos cartões (R$ ${somaCartoes.toFixed(2)}) deve ser igual ao restante (R$ ${total_amount.toFixed(2)})`,
                });
            }
        }

        const firstCouponId = validatedCoupons.length > 0 ? validatedCoupons[0].id : null;

        const order = await orderDao.createOrder(
            user_id,
            address_id,
            firstCouponId,
            totalBeforeDiscount,
            freight,
        );

        for (let k = 0; k < items.length; k++) {
            const item = items[k];
            await orderDao.createOrderItem(order.id, item.book_id, item.quantity, Number(item.price));
        }

        if (total_amount > 0) {
            for (let m = 0; m < cardsPayment.length; m++) {
                await orderDao.createPayment(
                    order.id,
                    Number(cardsPayment[m].card_id),
                    Number(cardsPayment[m].amount),
                );
            }
        }

        await orderDao.updateOrderStatus(order.id, "em_processamento");
        await orderDao.clearCart(user_id);

        for (let c = 0; c < validatedCoupons.length; c++) {
            const cp = validatedCoupons[c];

            await orderDao.createOrderCoupon(
                order.id,
                cp.id,
                cp.appliedValue,
                cp.code,
                cp.type,
            );

            if (cp.type === "promocional") {
                await couponDao.registerUsage(cp.id, user_id);
            } else {
                await couponDao.markAsUsed(cp.id);
            }
        }

        let generatedChangeCoupon = null;
        if (changeCouponValue > 0) {
            generatedChangeCoupon = await couponDao.createExchangeCoupon(
                user_id,
                order.id,
                changeCouponValue,
            );
        }

        const response = {
            message: "Pedido realizado com sucesso!",
            order_id: order.id,
            total: total_amount,
            freight: freight,
            discount: totalDiscount,
            status: "em_processamento",
        };

        if (generatedChangeCoupon) {
            response.change_coupon = {
                code: generatedChangeCoupon.code,
                value: Number(generatedChangeCoupon.value),
            };
            response.message += ` Cupom de troco gerado: ${generatedChangeCoupon.code} (R$ ${Number(generatedChangeCoupon.value).toFixed(2)})`;
        }

        res.status(201).json(response);
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
        console.error("Erro ao buscar pedido:", error);
        res.status(500).json({ error: "Erro ao buscar pedido" });
    }
};

exports.requestExchange = async function (req, res) {
    try {
        const reason = req.body.reason;
        const items = req.body.items || [];

        const order = await orderDao.getOrderById(req.params.id, req.user.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        if (order.status !== "entregue") {
            return res.status(400).json({
                error: "Só é possível solicitar troca de pedidos entregues",
            });
        }

        if (!items || items.length === 0) {
            return res
                .status(400)
                .json({ error: "Selecione pelo menos um item para troca" });
        }

        if (!reason || reason.trim().length === 0) {
            return res
                .status(400)
                .json({ error: "Motivo da troca é obrigatório" });
        }

        const orderItemIds = (order.items || []).map((i) => i.id);
        for (const item of items) {
            if (!orderItemIds.includes(item.order_item_id)) {
                return res.status(400).json({
                    error: `Item ${item.order_item_id} não pertence a este pedido`,
                });
            }
        }

        const exchangeItems = items.map((item) => ({
            order_item_id: item.order_item_id,
            reason: reason.trim(),
        }));

        const updated = await orderDao.requestExchange(order.id, exchangeItems);

        res.status(200).json({
            message: "Troca solicitada com sucesso",
            order: updated,
        });
    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        res.status(500).json({ error: "Erro ao solicitar troca" });
    }
};
