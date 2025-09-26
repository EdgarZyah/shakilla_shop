// shakilla_shop/server/app.js

// shakilla_shop/server/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/dbconfig");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const cartItemRoutes = require("./routes/cartItemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const messageRoutes = require("./routes/messageRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// Tambahkan middleware untuk menyajikan file statis dari folder "uploads" di sisi client
app.use('/uploads', express.static(path.join(__dirname, '../client/uploads')));

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

sequelize
  .authenticate()
  .then(() => console.log("Koneksi database sukses!"))
  .catch((err) => console.error("Gagal koneksi database:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", cartRoutes);
app.use("/api", cartItemRoutes);
app.use("/api", categoryRoutes);
app.use("/api", messageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", orderItemRoutes);
app.use("/api", paymentRoutes);
app.use("/api", productRoutes);
app.use("/api", shippingRoutes);
app.use("/api", userRoutes);

app.get("/", (_req, res) => {
  res.send("Server berjalan!");
});

app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ message: "Error 404 Not Found." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});