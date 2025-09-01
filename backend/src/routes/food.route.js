import express from "express";
import {
  getFoodEntries,
  createFoodEntry,
  getFoodEntryById,
  updateFoodEntry,
  deleteFoodEntry,
  getFoodFavorites,
  createFoodFavorite,
  deleteFoodFavorite,
} from "../controllers/food.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getFoodEntries);
router.post("/", protectRoute, createFoodEntry);

// Favorites routes before generic id routes
router.get("/favorites", protectRoute, getFoodFavorites);
router.post("/favorites", protectRoute, createFoodFavorite);
router.delete("/favorites/:id", protectRoute, deleteFoodFavorite);

// Generic id routes
router.get("/:id", protectRoute, getFoodEntryById);
router.put("/:id", protectRoute, updateFoodEntry);
router.delete("/:id", protectRoute, deleteFoodEntry);

export default router;
