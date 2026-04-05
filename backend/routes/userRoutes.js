const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/users/profile", authMiddleware, userController.getProfile);
router.put("/users/profile", authMiddleware, userController.updateProfile);

router.post("/users", authMiddleware, userController.createUser);
router.get("/users", authMiddleware, userController.getUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);

router.put("/users/:id", authMiddleware, userController.updateUser);
router.patch("/users/:id/status", authMiddleware, userController.updateStatus);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;
