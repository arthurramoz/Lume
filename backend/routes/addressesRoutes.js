const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/addresses", authMiddleware, addressController.createAddress);
router.get("/addresses", authMiddleware, addressController.getAddresses);
router.get("/addresses/:id", authMiddleware, addressController.getAddressById);
router.put("/addresses/:id", authMiddleware, addressController.updateAddress);
router.delete("/addresses/:id", authMiddleware, addressController.deleteAddress);

module.exports = router;
