const express = require("express");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.route");
const libroRoutes = require("./routes/libro.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const reservaRoutes = require("./routes/reserva.routes");
const prestamoRoutes = require("./routes/prestamo.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://red-bush-0947a890f.7.azurestaticapps.net"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", function (req, res) {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/libros", libroRoutes);

app.use("/api/favorite", favoriteRoutes);

app.use("/api/reservas", reservaRoutes);

app.use("/api/prestamos", prestamoRoutes);

module.exports = app;
