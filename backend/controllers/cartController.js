const cartDao = require("../models/dao/cartDao");
const bookDao = require("../models/dao/booksDao");

exports.createCart = async function (req, res) {
    try {
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }

        const book_id = req.body.book_id;
        const quantity = req.body.quantity;
        const user_id = req.user.id;

        if (!book_id || !quantity) {
            return res
                .status(400)
                .json({ error: "book_id e quantity são obrigatórios" });
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
            const novaQuantidade = itemExistente.quantity + quantity;
            if (novaQuantidade > book.stock_quantity) {
                return res.status(400).json({
                    error: "Quantidade solicitada excede o estoque disponível",
                    maxAllowed: book.stock_quantity - itemExistente.quantity,
                });
            }
            finalItem = await cartDao.updateItemQuantity(
                itemExistente.id,
                quantity,
            );
        } else {
            if (quantity > book.stock_quantity) {
                return res.status(400).json({
                    error: "Quantidade solicitada excede o estoque disponível",
                    maxAllowed: book.stock_quantity,
                });
            }
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

exports.getCartItems = async function (req, res) {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);

        if (!cart) {
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

exports.deleteCartItem = async function (req, res) {
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

exports.updateCartItem = async function (req, res) {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }

        const item = await cartDao.findCartItemById(req.params.id);
        if (!item) {
            return res
                .status(404)
                .json({ error: "Item não encontrado no carrinho" });
        }

        const book = await bookDao.findById(item.book_id);
        if (!book) {
            return res.status(404).json({ error: "Livro não encontrado" });
        }

        if (req.body.quantity > book.stock_quantity) {
            return res.status(400).json({
                error: "Quantidade solicitada excede o estoque disponível",
                maxAllowed: book.stock_quantity,
            });
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

exports.getCartCount = async function (req, res) {
    try {
        const cart = await cartDao.findCartByUserId(req.user.id);

        if (!cart) {
            return res.status(200).json({ count: 0 });
        }

        const items = await cartDao.getCartItems(cart.id);
        const count = items.length;
        res.status(200).json({ count: count });
    } catch (error) {
        console.error("Erro ao contar itens do carrinho:", error);
        res.status(500).json({ error: "Erro ao contar itens do carrinho" });
    }
};
