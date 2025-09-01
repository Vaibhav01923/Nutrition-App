import express from "express";
import {
  getWeightLogs,
  createWeightLog,
  getWeightLogById,
  updateWeightLog,
  deleteWeightLog,
} from "../controllers/weight.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getWeightLogs);
router.post("/", protectRoute, createWeightLog);
router.get("/:id", protectRoute, getWeightLogById);
router.put("/:id", protectRoute, updateWeightLog);
router.delete("/:id", protectRoute, deleteWeightLog);

export default router;
