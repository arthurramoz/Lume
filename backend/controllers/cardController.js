const cardsDao = require("../models/dao/cardsDao");

exports.createCard = async (req, res) => {
    try {
        // Se for cliente, força o user_id dele no body
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }

        const newCard = await cardsDao.create(req.body);
        res.status(201).json(newCard);
    } catch (error) {
        console.error("Erro na criação do cartão do usuário:", error);
        res.status(500).json({
            error: "Erro ao criar cartão no banco de dados",
            details: error.message,
        });
    }
};

exports.getCards = async (req, res) => {
    try {
        let cards = await cardsDao.findAll();

        // Se for cliente, filtra apenas os cartões dele
        if (req.user && req.user.role === "client") {
            cards = cards.filter(c => c.user_id === req.user.id);
        }

        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar cartões no banco de dados",
        });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            const card = await cardsDao.findById(req.params.id);
            if (!card || card.user_id !== req.user.id) {
                return res.status(403).json({ error: "Acesso negado." });
            }
        }

        const deletedCard = await cardsDao.delete(req.params.id);
        res.status(200).json(deletedCard);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar cartão no banco de dados",
        });
    }
};
