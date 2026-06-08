const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/dashboard/sales-by-genre", dashboardController.getSalesByGenre);

module.exports = router;
