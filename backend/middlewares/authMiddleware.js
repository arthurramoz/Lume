const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "LUME_TOKEN_2026";

// Middleware que verifica se o usuário está autenticado
exports.authMiddleware = function (req, res, next) {
    // Pega o cabeçalho Authorization da requisição
    const authHeader = req.headers.authorization;

    // Se não tem cabeçalho, o usuário não enviou token
    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido. Acesso negado." });
    }

    // Separa o cabeçalho em duas partes: "Bearer" e o token
    const parts = authHeader.split(" ");

    // Verifica se tem exatamente 2 partes e se a primeira é "Bearer"
    if (parts.length !== 2) {
        return res.status(401).json({ error: "Formato de token inválido." });
    }

    if (parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido." });
    }

    // Pega só o token (segunda parte)
    const token = parts[1];

    try {
        // Tenta decodificar o token usando a chave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // Salva os dados do usuário na requisição para os próximos controllers usarem
        // Exemplo: { id: 1, email: "...", role: "client" }
        req.user = decoded;

        // Continua para a próxima função (controller)
        return next();
    } catch (error) {
        // Se o token é inválido ou expirou, retorna erro
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};
