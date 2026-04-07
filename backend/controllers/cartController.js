const cartDao = require("../models/dao/cartDao");
const bookDao = require("../models/dao/booksDao");

exports.createCart = async function (req, res) {
    try {
        // Se é um cliente, usa o ID dele automaticamente
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }

        const book_id = req.body.book_id;
        const quantity = req.body.quantity;
        const user_id = req.user.id;

        // Verifica se os campos obrigatórios foram enviados
        if (!book_id || !quantity) {
            return res.status(400).json({ error: "book_id e quantity são obrigatórios" });
        }

        // Verifica se o livro existe
        const book = await bookDao.findById(book_id);
        if (!book) {
            return res.status(404).json({ error: "Livro não encontrado" });
        }

        // Busca o carrinho do usuário
        let cart = await cartDao.findCartByUserId(user_id);

        // Se não tem carrinho, cria um novo
        if (!cart) {
            cart = await cartDao.createCart(user_id);
        }

        // Verifica se o livro já está no carrinho
        const itemExistente = await cartDao.findItemInCart(cart.id, book_id);

        let finalItem;

        if (itemExistente) {
            // Se já existe, aumenta a quantidade
            finalItem = await cartDao.updateItemQuantity(itemExistente.id, quantity);
        } else {
            // Se não existe, adiciona como novo item
            finalItem = await cartDao.createCartItem(cart.id, book_id, quantity);
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

// Busca todos os itens do carrinho do usuário
exports.getCartItems = async function (req, res) {
    try {
        // Busca o carrinho do usuário
        const cart = await cartDao.findCartByUserId(req.user.id);

        // Se não tem carrinho, retorna lista vazia
        if (!cart) {
            return res.status(200).json([]);
        }

        // Busca os itens do carrinho
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

// Remove um item do carrinho
exports.deleteCartItem = async function (req, res) {
    try {
        // Verifica se o usuário tem carrinho
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }

        // Deleta o item
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

// Atualiza a quantidade de um item do carrinho
exports.updateCartItem = async function (req, res) {
    try {
        // Verifica se o usuário tem carrinho
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }

        // Atualiza a quantidade
        const updatedItem = await cartDao.updateCartItem(req.params.id, req.body.quantity);
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error("Erro ao atualizar item do carrinho:", error);
        res.status(500).json({
            error: "Erro ao atualizar item do carrinho no banco de dados",
            details: error.message,
        });
    }
};

// Conta quantos itens tem no carrinho
exports.getCartCount = async function (req, res) {
    try {
        // Busca o carrinho do usuário
        const cart = await cartDao.findCartByUserId(req.user.id);

        // Se não tem carrinho, retorna 0
        if (!cart) {
            return res.status(200).json({ count: 0 });
        }

        // Conta os itens
        const items = await cartDao.getCartItems(cart.id);
        const count = items.length;
        res.status(200).json({ count: count });
    } catch (error) {
        console.error("Erro ao contar itens do carrinho:", error);
        res.status(500).json({ error: "Erro ao contar itens do carrinho" });
    }
};
