require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const cardRoutes = require("./routes/cardRoutes");
const authRoutes = require("./routes/authRoutes");
const booksRoutes = require("./routes/booksRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCouponRoutes = require("./routes/adminCouponRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", addressesRoutes);
app.use("/api", cardRoutes);
app.use("/api", booksRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);
app.use("/api", shippingRoutes);
app.use("/api", adminOrderRoutes);
app.use("/api", adminCouponRoutes);
app.use("/api", chatbotRoutes);
app.use("/api", dashboardRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Servidor rodando em ${PORT}`);
});
