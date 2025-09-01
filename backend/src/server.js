import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import foodRoutes from "./routes/food.route.js";
import goalRoutes from "./routes/goal.route.js";
import weightRoutes from "./routes/weight.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { startSchedulers } from "./jobs/queue.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(clerkMiddleware());
app.use(express.json());
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/weight", weightRoutes);
app.use("/api/analytics", analyticsRoutes);

// Healthcheck
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState, // 1 = connected
    timestamp: new Date().toISOString(),
  });
});

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log("Server is running on port: ", ENV.PORT);
  connectDB();
  startSchedulers();
});
