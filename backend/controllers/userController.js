const userDao = require("../models/dao/usersDao");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_TOKEN_2026";
const ADMIN_EMAIL = "admin@lume.com";

exports.registerClient = async (req, res) => {
    try {
        const data = req.body;

        data.role = "client";
        data.status = "Ativo";

        if (data.password_hash) {
            const salt = await bcrypt.genSalt(10);
            data.password_hash = await bcrypt.hash(data.password_hash, salt);
        }

        const newUser = await userDao.create(data);

        const tokenPayload = {
            id: newUser.id,
            email: newUser.email,
            role: "client",
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("Erro no cadastro de cliente:", error);
        res.status(500).json({
            error: "Erro ao criar cliente no banco de dados",
            details: error.message,
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await userDao.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.role;
        delete updateData.status;
        delete updateData.email;
        delete updateData.cpf;

        const updatedUser = await userDao.update(req.user.id, updateData);
        if (!updatedUser) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
};

exports.createUser = async (req, res) => {
    try {
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
        if (req.user && req.user.role === "client") {
            const user = await userDao.findById(req.user.id);
            return res.status(200).json([user]);
        }

        const { search } = req.query;
        const users = await userDao.findAll(search);
        const filtered = users.filter((u) => u.email !== ADMIN_EMAIL);
        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao buscar usuários no banco de dados.",
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        let idToSearch;

        if (req.user && req.user.role === "client") {
            idToSearch = req.user.id;
        } else {
            idToSearch = req.params.id;
        }

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
            idToUpdate = req.user.id;
            delete updateData.role;
            delete updateData.status;
        }

        const target = await userDao.findById(idToUpdate);
        if (target && target.email === ADMIN_EMAIL) {
            return res
                .status(403)
                .json({
                    error: "O usuário administrador não pode ser editado.",
                });
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
        if (req.user && req.user.role !== "admin") {
            return res.status(403).json({ error: "Acesso negado." });
        }

        const target = await userDao.findById(req.params.id);
        if (target && target.email === ADMIN_EMAIL) {
            return res
                .status(403)
                .json({
                    error: "O usuário administrador não pode ser inativado.",
                });
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
        let idToDelete;

        if (req.user && req.user.role === "client") {
            idToDelete = req.user.id;
        } else {
            idToDelete = req.params.id;
        }

        const target = await userDao.findById(idToDelete);
        if (target && target.email === ADMIN_EMAIL) {
            return res
                .status(403)
                .json({
                    error: "O usuário administrador não pode ser excluído.",
                });
        }

        const deletedUser = await userDao.delete(idToDelete);
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao deletar usuário no banco de dados",
        });
    }
};
