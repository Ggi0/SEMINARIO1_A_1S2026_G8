const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const errorMiddleware = require("./middlewares/error.middleware");
const loggerMiddleware = require("./middlewares/logger.middleware");

const app = express();

/* =========================
   MIDDLEWARES GLOBALES
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

/* =========================
   RUTAS
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* =========================
   MANEJO DE ERRORES
========================= */

app.use(errorMiddleware);

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});