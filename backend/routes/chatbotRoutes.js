const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/chatbot", authMiddleware, chatbotController.chat);

module.exports = router;
