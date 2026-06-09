const dashboardDao = require("../models/dao/dashboardDao");

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

        const rows = await dashboardDao.findSalesByGenre(start_date, end_date);

        // Organizar dados: extrair labels (meses) e datasets (gêneros)
        const monthsMap = new Map();
        const genresSet = new Set();

        for (const row of rows) {
            monthsMap.set(row.month_key, row.month_label);
            genresSet.add(row.genre_name);
        }

        const sortedMonthKeys = [...monthsMap.keys()].sort();
        const labels = sortedMonthKeys.map((key) => monthsMap.get(key));
        const genreNames = [...genresSet].sort();

        // Montar lookup: { "2025-06|Infantil": 12 }
        const dataLookup = {};
        for (const row of rows) {
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
