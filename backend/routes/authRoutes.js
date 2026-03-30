const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// Rota de Login (Pública)
router.post("/login", authController.login);

// Rota de Registro Público de Clientes (Pública)
router.post("/register", userController.registerClient);

module.exports = router;
