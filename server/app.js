require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

// Import Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");

// Import Middleware Visitor Tracker
const trackVisitor = require('./middlewares/visitorTracker');

// Database Connection
const db = require("./models");
db.sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Database connection error:", err.message));

// ================= CORS =================
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= VISITOR TRACKING =================
app.use(trackVisitor);

// ================= STATIC FILES =================
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads", "products"))
);

app.use(
  "/uploads/payments",
  express.static(path.join(__dirname, "uploads", "payments"))
);

app.use(
  "/uploads/receipts",
  express.static(path.join(__dirname, "uploads", "receipts"))
);

// Root Test Route
app.get("/", (req, res) => {
  res.send("🛍️ Shakilla Shop Backend is Running!");
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

// Server Listener
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});