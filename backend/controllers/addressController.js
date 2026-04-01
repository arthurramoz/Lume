const addressDao = require("../models/dao/addressDao");

exports.createAddress = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }
        const newAddress = await addressDao.create(req.body);
        res.status(201).json(newAddress);
    } catch (error) {
        console.error("Erro na criação do endereço do usuário:", error);
        res.status(500).json({
            error: "Erro ao criar endereço no banco de dados",
            details: error.message,
        });
    }
};

exports.getAddresses = async (req, res) => {
    try {
        let addresses = await addressDao.findAll();

        // Se for cliente, filtra apenas os endereços dele
        if (req.user && req.user.role === "client") {
            addresses = addresses.filter((a) => a.user_id === req.user.id);
        }

        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar endereços no banco de dados",
        });
    }
};

exports.getAddressById = async (req, res) => {
    try {
        const address = await addressDao.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ error: "Endereço não encontrado" });
        }

        // Se for cliente, garante que o endereço é dele
        if (
            req.user &&
            req.user.role === "client" &&
            address.user_id !== req.user.id
        ) {
            return res.status(403).json({ error: "Acesso negado." });
        }

        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar endereço no banco de dados",
        });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            const address = await addressDao.findById(req.params.id);
            if (!address || address.user_id !== req.user.id) {
                return res.status(403).json({ error: "Acesso negado." });
            }
        }

        const updatedAddress = await addressDao.update(req.params.id, req.body);
        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error("ERRO NO UPDATE:", error);
        res.status(500).json({
            error: "Erro ao atualizar endereço no banco de dados",
            detalhes: error.message,
        });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            const address = await addressDao.findById(req.params.id);
            if (!address || address.user_id !== req.user.id) {
                return res.status(403).json({ error: "Acesso negado." });
            }
        }

        const deletedAddress = await addressDao.delete(req.params.id);
        res.status(200).json(deletedAddress);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar endereço no banco de dados",
        });
    }
};
