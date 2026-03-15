import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";

import productRouter from "./routes/product.js";
import authRouter from "./routes/auth.js";

import { requireAuth } from './middleware/authMiddleware.js';
import orderRouter from "./routes/order.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json());

app.use("/api/health", healthRouter);

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);

app.get("/api/me", requireAuth, (req, res) => {
  res.status(200).json({
    message: "Authenticated",
  })
})

export default app;
