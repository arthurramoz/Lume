const pool = require("../config/database");

/**
 * GET /api/dashboard/sales-by-genre?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 *
 * Retorna a quantidade de itens vendidos agrupados por gênero e mês,
 * considerando apenas pedidos com status relevantes (não aguardando_pagamento).
 *
 * Response: {
 *   labels: ["Jun/2025", "Jul/2025", ...],
 *   genres: [
 *     { name: "Infantil", data: [12, 8, ...] },
 *     { name: "Conto de Fadas", data: [5, 3, ...] },
 *   ]
 * }
 */
exports.getSalesByGenre = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                error: "Parâmetros start_date e end_date são obrigatórios (formato YYYY-MM-DD)",
            });
        }

        // Query: vendas por gênero agrupadas por mês
        const query = `
            SELECT
                TO_CHAR(o.created_at, 'YYYY-MM') AS month_key,
                TO_CHAR(o.created_at, 'Mon/YYYY') AS month_label,
                g.name AS genre_name,
                COALESCE(SUM(oi.quantity), 0) AS total_quantity
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN books b ON oi.book_id = b.id
            JOIN genres g ON b.genre_id = g.id
            WHERE o.created_at >= $1::date
              AND o.created_at < ($2::date + INTERVAL '1 day')
              AND o.status NOT IN ('aguardando_pagamento')
            GROUP BY month_key, month_label, g.name
            ORDER BY month_key ASC, g.name ASC
        `;

        const result = await pool.query(query, [start_date, end_date]);

        // Organizar dados: extrair labels (meses) e datasets (gêneros)
        const monthsMap = new Map();
        const genresSet = new Set();

        for (const row of result.rows) {
            monthsMap.set(row.month_key, row.month_label);
            genresSet.add(row.genre_name);
        }

        const sortedMonthKeys = [...monthsMap.keys()].sort();
        const labels = sortedMonthKeys.map((key) => monthsMap.get(key));
        const genreNames = [...genresSet].sort();

        // Montar lookup: { "2025-06|Infantil": 12 }
        const dataLookup = {};
        for (const row of result.rows) {
            dataLookup[`${row.month_key}|${row.genre_name}`] = parseInt(row.total_quantity);
        }

        // Montar array de gêneros com dados por mês
        const genres = genreNames.map((name) => ({
            name,
            data: sortedMonthKeys.map((monthKey) => dataLookup[`${monthKey}|${name}`] || 0),
        }));

        res.status(200).json({ labels, genres });
    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        res.status(500).json({ error: "Erro ao buscar dados do dashboard" });
    }
};
