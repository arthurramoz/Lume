const orderDao = require("../models/dao/orderDao");
const cartDao = require("../models/dao/cartDao");
const couponDao = require("../models/dao/couponDao");

exports.createOrder = async function (req, res) {
    try {
        var user_id = req.user.id;
        var address_id = req.body.address_id;
        var cardsPayment = req.body.cards; // Array de { card_id, amount }
        var body_coupon_id = req.body.coupon_id;
        var coupon_code = req.body.coupon_code;

        // Verifica se endereço foi enviado
        if (!address_id) {
            return res.status(400).json({ error: "Endereço é obrigatório" });
        }

        // Verifica se pelo menos um cartão foi enviado
        if (!cardsPayment || cardsPayment.length === 0) {
            return res.status(400).json({ error: "Pelo menos um cartão é obrigatório" });
        }

        // Busca o carrinho do usuário
        var cart = await cartDao.findCartByUserId(user_id);
        if (!cart) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        // Busca os itens do carrinho
        var items = await cartDao.getCartItems(cart.id);
        if (items.length === 0) {
            return res.status(400).json({ error: "Carrinho vazio" });
        }

        // Calcula o subtotal somando preço * quantidade de cada item
        var subtotal = 0;
        for (var i = 0; i < items.length; i++) {
            var preco = Number(items[i].price);
            var quantidade = Number(items[i].quantity);
            subtotal = subtotal + (preco * quantidade);
        }

        // Tenta buscar o cupom (se foi enviado)
        var coupon_id = null;
        var discount = 0;
        var coupon = null;

        if (body_coupon_id) {
            coupon = await couponDao.findById(body_coupon_id);
        } else if (coupon_code) {
            coupon = await couponDao.findByCode(coupon_code);
        }

        // Se encontrou o cupom, valida ele
        if (coupon) {
            if (coupon.is_used) {
                return res.status(400).json({ error: "Cupom já foi utilizado" });
            }

            if (coupon.expires_at) {
                var dataExpiracao = new Date(coupon.expires_at);
                var dataAtual = new Date();

                if (dataExpiracao < dataAtual) {
                    return res.status(400).json({ error: "Cupom expirado" });
                }
            }

            coupon_id = coupon.id;
            discount = Number(coupon.value);
        }

        // Calcula o total (subtotal - desconto, mínimo 0)
        var total_amount = subtotal - discount;
        if (total_amount < 0) {
            total_amount = 0;
        }

        // Valida a soma dos valores dos cartões
        var somaCartoes = 0;
        for (var j = 0; j < cardsPayment.length; j++) {
            var cardAmount = Number(cardsPayment[j].amount);

            if (!cardsPayment[j].card_id) {
                return res.status(400).json({ error: "Selecione um cartão em todas as linhas" });
            }

            if (cardAmount <= 0) {
                return res.status(400).json({ error: "O valor de cada cartão deve ser maior que R$ 0,00" });
            }

            // Regra do mínimo de R$ 10,00
            // Exceção: se tem cupom e o restante no cartão é menor que R$ 10
            if (cardAmount < 10) {
                if (!coupon) {
                    return res.status(400).json({
                        error: "O valor mínimo por cartão é R$ 10,00"
                    });
                }
                // Se tem cupom mas o total restante é >= R$ 10 por cartão, bloqueia
                if (total_amount >= 10 * cardsPayment.length) {
                    return res.status(400).json({
                        error: "O valor mínimo por cartão é R$ 10,00"
                    });
                }
            }

            somaCartoes = somaCartoes + cardAmount;
        }

        // Arredonda para evitar problemas de ponto flutuante
        somaCartoes = Math.round(somaCartoes * 100) / 100;
        total_amount = Math.round(total_amount * 100) / 100;

        if (somaCartoes !== total_amount) {
            return res.status(400).json({
                error: "A soma dos valores dos cartões (R$ " + somaCartoes.toFixed(2) + ") deve ser igual ao total do pedido (R$ " + total_amount.toFixed(2) + ")"
            });
        }

        // Cria o pedido no banco
        var order = await orderDao.createOrder(user_id, address_id, coupon_id, total_amount);

        // Adiciona cada item do carrinho ao pedido
        for (var k = 0; k < items.length; k++) {
            var item = items[k];
            await orderDao.createOrderItem(
                order.id,
                item.book_id,
                item.quantity,
                Number(item.price)
            );
        }

        // Cria um pagamento para cada cartão
        for (var m = 0; m < cardsPayment.length; m++) {
            await orderDao.createPayment(
                order.id,
                Number(cardsPayment[m].card_id),
                Number(cardsPayment[m].amount)
            );
        }

        // Atualiza o status do pedido
        await orderDao.updateOrderStatus(order.id, "em_processamento");

        // Limpa o carrinho
        await orderDao.clearCart(user_id);

        // Se usou cupom, marca como usado
        if (coupon) {
            await couponDao.markAsUsed(coupon.id);
        }

        // Retorna o pedido criado
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

exports.getOrders = async function (req, res) {
    try {
        var orders = await orderDao.getOrdersByUserId(req.user.id);
        res.status(200).json(orders);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
};

exports.getOrderById = async function (req, res) {
    try {
        var order = await orderDao.getOrderById(req.params.id, req.user.id);

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
        var reason = req.body.reason;

        var order = await orderDao.getOrderById(req.params.id, req.user.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        if (order.status !== "entregue") {
            return res.status(400).json({
                error: "Só é possível solicitar troca de pedidos entregues",
            });
        }

        if (!reason) {
            return res.status(400).json({ error: "Motivo da troca é obrigatório" });
        }

        if (reason.trim().length === 0) {
            return res.status(400).json({ error: "Motivo da troca é obrigatório" });
        }

        var updated = await orderDao.updateOrderStatus(order.id, "em_troca");

        res.status(200).json({
            message: "Troca solicitada com sucesso",
            order: updated,
        });
    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        res.status(500).json({ error: "Erro ao solicitar troca" });
    }
};
