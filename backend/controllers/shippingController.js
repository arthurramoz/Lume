const shippingDao = require("../models/dao/shippingDao");
const addressDao = require("../models/dao/addressDao");

exports.getShippingByAddress = async function (req, res) {
    try {
        const address_id = req.params.address_id;

        // Busca o endereço
        const address = await addressDao.findById(address_id);
        if (!address) {
            return res.status(404).json({ error: "Endereço não encontrado" });
        }

        // Verifica se o endereço é do usuário
        if (req.user && req.user.role === "client" && address.user_id !== req.user.id) {
            return res.status(403).json({ error: "Acesso negado" });
        }

        // Busca a taxa de frete pelo estado
        const shipping = await shippingDao.findByState(address.state);
        if (!shipping) {
            return res.status(200).json({
                rate: 0,
                estimated_days: 15,
                state: address.state,
                message: "Frete não disponível para este estado"
            });
        }

        res.status(200).json({
            rate: Number(shipping.rate),
            estimated_days: shipping.estimated_days,
            state: address.state
        });
    } catch (error) {
        console.error("Erro ao calcular frete:", error);
        res.status(500).json({ error: "Erro ao calcular frete" });
    }
};

exports.getAllRates = async function (req, res) {
    try {
        const rates = await shippingDao.findAll();
        res.status(200).json(rates);
    } catch (error) {
        console.error("Erro ao buscar taxas de frete:", error);
        res.status(500).json({ error: "Erro ao buscar taxas de frete" });
    }
};
