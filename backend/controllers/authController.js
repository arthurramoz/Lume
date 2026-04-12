const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userDao = require("../models/dao/usersDao");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_TOKEN_2026";
const ADMIN_EMAIL = "admin@lume.com";

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email e senha são obrigatórios." });
        }

        const user = await userDao.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        let role;

        if (user.email === ADMIN_EMAIL) {
            role = "admin";
        } else {
            role = "client";
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: role,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            message: "Login realizado com sucesso",
            token: token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: role,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({
            error: "Erro interno ao realizar login",
            details: error.message,
        });
    }
};
