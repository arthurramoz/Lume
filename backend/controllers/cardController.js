const cardsDao = require("../models/dao/cardsDao");

exports.createCard = async function (req, res) {
    try {
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

exports.getCards = async function (req, res) {
    try {
        var allCards = await cardsDao.findAll();

        if (req.user && req.user.role === "client") {
            var userCards = [];
            for (var i = 0; i < allCards.length; i++) {
                if (allCards[i].user_id === req.user.id) {
                    userCards.push(allCards[i]);
                }
            }
            return res.status(200).json(userCards);
        }

        res.status(200).json(allCards);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar cartões no banco de dados",
        });
    }
};

exports.deleteCard = async function (req, res) {
    try {
        if (req.user && req.user.role === "client") {
            var card = await cardsDao.findById(req.params.id);

            if (!card) {
                return res.status(403).json({ error: "Acesso negado." });
            }
            if (card.user_id !== req.user.id) {
                return res.status(403).json({ error: "Acesso negado." });
            }
        }

        var deletedCard = await cardsDao.delete(req.params.id);
        res.status(200).json(deletedCard);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar cartão no banco de dados",
        });
    }
};
