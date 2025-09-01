import express from "express";
import {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getGoals);
router.post("/", protectRoute, createGoal);
router.get("/:id", protectRoute, getGoalById);
router.put("/:id", protectRoute, updateGoal);
router.delete("/:id", protectRoute, deleteGoal);

export default router;
