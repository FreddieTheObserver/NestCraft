import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";

import productRouter from "./routes/product.js";
import { getProducts } from "./controllers/productController.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json());

app.use("/api/health", healthRouter);

app.use("/api/products", productRouter);

export default app;
