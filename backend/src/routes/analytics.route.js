import express from "express";
import {
  getDailySummary,
  getWeeklySummary,
  getFoodMacroDistribution,
  getWeightProgress,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/today", protectRoute, getDailySummary);
router.get("/week", protectRoute, getWeeklySummary);
router.get("/macros", protectRoute, getFoodMacroDistribution);
router.get("/weight", protectRoute, getWeightProgress);

export default router;
