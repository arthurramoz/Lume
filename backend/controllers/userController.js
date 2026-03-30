const userDao = require("../models/dao/usersDao");
const bcrypt = require("bcryptjs");

// ==========================================
// ROTAS PÚBLICAS (Sem Autenticação)
// ==========================================

exports.registerClient = async (req, res) => {
    try {
        const data = req.body;
        // Força o papel como "client" e status "Ativo" por segurança
        data.role = "client";
        data.status = "Ativo";

        if (data.password_hash) {
            const salt = await bcrypt.genSalt(10);
            data.password_hash = await bcrypt.hash(data.password_hash, salt);
        }

        const newUser = await userDao.create(data);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro no cadastro de cliente:", error);
        res.status(500).json({
            error: "Erro ao criar cliente no banco de dados",
            details: error.message,
        });
    }
};

// ==========================================
// ROTAS DO ADMIN E CLIENTE
// Assume que req.user = { id, role } existe
// ==========================================

exports.createUser = async (req, res) => {
    try {
        // Admin pode criar mandando qualquer role no body
        if (req.user && req.user.role !== "admin") {
            return res.status(403).json({ error: "Acesso negado." });
        }
        
        const data = req.body;
        if (data.password_hash) {
            const salt = await bcrypt.genSalt(10);
            data.password_hash = await bcrypt.hash(data.password_hash, salt);
        }

        const newUser = await userDao.create(data);
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro na criação do usuário:", error);
        res.status(500).json({
            error: "Erro ao criar usuário no banco de dados",
            details: error.message,
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        // Se for cliente, retorna apenas os dados dele
        if (req.user && req.user.role === "client") {
            const user = await userDao.findById(req.user.id);
            return res.status(200).json([user]);
        }
        
        const { search } = req.query;
        const users = await userDao.findAll(search);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar usuários no banco de dados.",
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const idToSearch = (req.user && req.user.role === "client") ? req.user.id : req.params.id;

        const user = await userDao.findById(idToSearch);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar usuário no banco de dados",
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        let idToUpdate = req.params.id;
        const updateData = { ...req.body };

        if (req.user && req.user.role === "client") {
            idToUpdate = req.user.id; // Força atualizar a si mesmo
            // Protege campos sensíveis de clientes
            delete updateData.role;
            delete updateData.status;
        }

        const updatedUser = await userDao.update(idToUpdate, updateData);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao atualizar usuário no banco de dados",
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        // Somente admin deveria mudar status dessa forma
        if (req.user && req.user.role !== "admin") {
            return res.status(403).json({ error: "Acesso negado." });
        }

        const { status } = req.body;
        const updatedUser = await userDao.updateStatus(req.params.id, status);
        if (!updatedUser) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        res.status(500).json({
            error: "Erro ao atualizar status no banco de dados",
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Geralmente apenas Admin pode deletar fisicamente, mas se cliente puder, forçamos o ID
        const idToDelete = (req.user && req.user.role === "client") ? req.user.id : req.params.id;

        const deletedUser = await userDao.delete(idToDelete);
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar usuário no banco de dados",
        });
    }
};
