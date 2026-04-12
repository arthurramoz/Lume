const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_TOKEN_2026";

exports.authMiddleware = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido. Acesso negado." });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
        return res.status(401).json({ error: "Formato de token inválido." });
    }

    if (parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido." });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};
