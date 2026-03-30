require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const cardRoutes = require("./routes/cardRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // Novas rotas públicas
app.use("/api", userRoutes);
app.use("/api", addressesRoutes);
app.use("/api", cardRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Servidor rodando em ${PORT}`);
});
