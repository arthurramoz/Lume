const dashboardDao = require("../models/dao/dashboardDao");

exports.getSalesByGenre = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                error: "Parâmetros start_date e end_date são obrigatórios (formato YYYY-MM-DD)",
            });
        }

        const rows = await dashboardDao.findSalesByGenre(start_date, end_date);


        const monthsMap = new Map();
        const genresSet = new Set();

        for (const row of rows) {
            monthsMap.set(row.month_key, row.month_label);
            genresSet.add(row.genre_name);
        }

        const sortedMonthKeys = [...monthsMap.keys()].sort();
        const labels = sortedMonthKeys.map((key) => monthsMap.get(key));
        const genreNames = [...genresSet].sort();


        const dataLookup = {};
        for (const row of rows) {
            dataLookup[`${row.month_key}|${row.genre_name}`] = parseInt(row.total_quantity);
        }


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
