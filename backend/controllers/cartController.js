const cartDao = require("../models/dao/cartDao");

exports.createCart = async (req, res) => {
    try {
        if (req.user && req.user.role === "client") {
            req.body.user_id = req.user.id;
        }

        const { book_id, quantity } = req.body;
        const user_id = req.user.id;

        // 2. Tenta encontrar o carrinho aberto do usuário
        let cart = await cartDao.findCartByUserId(user_id);

        // 3. Se não existir, cria um novo
        if (!cart) {
            cart = await cartDao.createCart(user_id);
        }

        // 4. Verifica se ESSE livro já está dentro DAQUELE carrinho
        const itemExistente = await cartDao.findItemInCart(cart.id, book_id);

        let finalItem;

        if (itemExistente) {
            // 5A. Se já existe, apenas soma a quantidade enviada com a que já estava lá
            finalItem = await cartDao.updateItemQuantity(
                itemExistente.id,
                quantity,
            );
        } else {
            // 5B. Se não existe, cria a linha nova na tabela de itens
            finalItem = await cartDao.createCartItem(
                cart.id,
                book_id,
                quantity,
            );
        }

        // 6. Devolve a resposta de sucesso uma única vez no final!
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
