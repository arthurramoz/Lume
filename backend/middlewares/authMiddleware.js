const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_TOKEN_2026";

exports.authMiddleware = (req, res, next) => {
    // Busca o token no cabeçalho Authorization, que o navegador envia
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ error: "Token não fornecido. Acesso negado." });
    }

    // O formato esperado é "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido." });
    }

    const token = parts[1];

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Injeta os dados do usuário na requisição para que os próximos controllers possam usar
        req.user = decoded; // Ex: { id: 1, email: "...", role: "client" }

        return next(); // Segue para a controller
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};
