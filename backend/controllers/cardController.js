const cardsDao = require("../models/dao/cardsDao");

exports.createCard = async (req, res) => {
    try {
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
        const card = await cardsDao.findAll();
        res.status(200).json(card);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar cartões no banco de dados",
        });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const deletedCard = await cardsDao.delete(req.params.id);
        res.status(200).json(deletedCard);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar cartão no banco de dados",
        });
    }
};
