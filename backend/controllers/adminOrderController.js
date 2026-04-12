const orderDao = require("../models/dao/orderDao");

const VALID_STATUSES = [
    "em_processamento",
    "em_transito",
    "entregue",
    "em_troca",
    "solicitacao_de_troca",
    "troca_autorizada",
    "troca_concluida",
];

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

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                error: "Status inválido",
                valid: VALID_STATUSES,
            });
        }

        const order = await orderDao.getOrderByIdAdmin(req.params.id);

        if (!order) {
            return res.status(404).json({ error: "Pedido não encontrado" });
        }

        const updated = await orderDao.updateDeliveryStatus(req.params.id, status);

        res.status(200).json({
            message: "Status atualizado com sucesso",
            order: updated,
        });
    } catch (error) {
        console.error("Erro ao atualizar status do pedido (admin):", error);
        res.status(500).json({ error: "Erro ao atualizar status do pedido" });
    }
};
