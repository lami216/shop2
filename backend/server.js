import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import categoryRoutes from "./routes/category.route.js";
import publicConfigRoutes from "./routes/publicConfig.route.js";

import { connectDB } from "./lib/db.js";

// اقرأ الـ env من مسار ثابت خارج مجلد المشروع
dotenv.config({ path: "/etc/shop2/.env" });

const app = express();
const PORT = process.env.PORT || 10002;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public-config", publicConfigRoutes);

app.use("/image", express.static(path.join(projectRoot, "image")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(projectRoot, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
