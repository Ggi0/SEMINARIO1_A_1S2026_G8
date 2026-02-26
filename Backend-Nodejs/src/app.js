const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const movieRoutes = require("./routes/movie.routes");
const playlistRoutes = require("./routes/playlist.routes");


const errorMiddleware = require("./middlewares/error.middleware");
const loggerMiddleware = require("./middlewares/logger.middleware");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

/* =========================
   MIDDLEWARES GLOBALES
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
/* =========================
   RUTAS
========================= */

app.use("/api/movies", movieRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/notifications", notificationRoutes);

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