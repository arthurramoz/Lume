const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userDao = require("../models/dao/usersDao");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_SECRET_TOKEN_2026";
// Defina aqui o email oficial do Administrador do sistema
const ADMIN_EMAIL = "admin@lume.com";

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios." });
        }

        // 1. Buscar o usuário pelo email
        const user = await userDao.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        // 2. Verificar a senha
        // Atenção: como os usuários antigos não tinham bcrypt, se a senha no banco não for hash, bcrypt vai falhar.
        // Se precisar suportar texto puro temporariamente (não recomendado), adicione uma lógica de fallback.
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        // 3. Determinar a Role dinamicamente pelo email
        const role = user.email === ADMIN_EMAIL ? "admin" : "client";

        // 4. Gerar o Token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: "7d" // Token expira em 7 dias
        });

        // 5. Retornar os dados
        res.status(200).json({
            message: "Login realizado com sucesso",
            token: token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: role
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({
            error: "Erro interno ao realizar login",
            details: error.message
        });
    }
};
