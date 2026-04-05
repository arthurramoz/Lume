const cartDao = require("../models/dao/cartDao");
const bookDao = require("../models/dao/booksDao");

exports.createCart = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }

        const { book_id, quantity } = req.body;
        const user_id = req.user.id;

        if (!book_id || !quantity) {
            return res.status(400).json({ error: "book_id e quantity são obrigatórios" });
        }

        const book = await bookDao.findById(book_id);
        if (!book) {
            return res.status(404).json({ error: "Livro não encontrado" });
        }

        let cart = await cartDao.findCartByUserId(user_id);

        if (!cart) {
            cart = await cartDao.createCart(user_id);
        }

        const itemExistente = await cartDao.findItemInCart(cart.id, book_id);

        let finalItem;

        if (itemExistente) {
            finalItem = await cartDao.updateItemQuantity(
                itemExistente.id,
                quantity,
            );
        } else {
            finalItem = await cartDao.createCartItem(
                cart.id,
                book_id,
                quantity,
            );
        }

        res.status(201).json(finalItem);
    } catch (error) {
        console.error("Erro na criação/atualização do carrinho:", error);
        res.status(500).json({
            error: "Erro ao processar o carrinho no banco de dados",
            details: error.message,
        });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            // Se não tem, o carrinho está vazio. Devolvemos uma lista vazia e encerramos aqui.
            return res.status(200).json([]);
        }
        const items = await cartDao.getCartItems(cart.id);
        res.status(200).json(items);
    } catch (error) {
        console.error("Erro ao buscar itens do carrinho:", error);
        res.status(500).json({
            error: "Erro ao buscar itens do carrinho no banco de dados",
            details: error.message,
        });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }
        const deletedItem = await cartDao.deleteCartItem(req.params.id);
        res.status(200).json(deletedItem);
    } catch (error) {
        console.error("Erro ao deletar item do carrinho:", error);
        res.status(500).json({
            error: "Erro ao deletar item do carrinho no banco de dados",
            details: error.message,
        });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }
        const updatedItem = await cartDao.updateCartItem(
            req.params.id,
            req.body.quantity,
        );
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Erro ao atualizar item do carrinho:", error);
        res.status(500).json({
            error: "Erro ao atualizar item do carrinho no banco de dados",
            details: error.message,
        });
    }
};

exports.getCartCount = async (req, res) => {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(200).json({ count: 0 });
        }
        const items = await cartDao.getCartItems(cart.id);
        const count = items.length;
        res.status(200).json({ count });
    } catch (error) {
        console.error("Erro ao contar itens do carrinho:", error);
        res.status(500).json({ error: "Erro ao contar itens do carrinho" });
    }
};
