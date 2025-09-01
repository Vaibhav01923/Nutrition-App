import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import FoodEntry from "../models/foodEntry.model.js";
import FoodFavorite from "../models/foodFavorite.model.js";

export const getFoodEntries = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { from, to } = req.query;
    const filter = { userId: dbUser._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const foodEntries = await FoodEntry.find(filter).sort({
      date: -1,
      time: -1,
    });

    return res.status(200).json({ foodEntries });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch food entries" });
  }
};

export const createFoodEntry = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const {
      date,
      time,
      name,
      calories,
      protein,
      fat,
      carbs,
      quantity,
      unit,
      favoriteId,
    } = req.body;

    if (!date || !time || !name || calories == null) {
      return res
        .status(400)
        .json({ message: "date, time, name, calories are required" });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const kcal = Number(calories);

    if (!Number.isFinite(kcal) || kcal <= 0) {
      return res.status(400).json({ message: "calories must be > 0" });
    }

    let validFavoriteId;
    if (favoriteId !== undefined) {
      if (!favoriteId) {
        validFavoriteId = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
          return res.status(400).json({ message: "Invalid favoriteId" });
        }
        const favorite = await FoodFavorite.findOne({
          _id: favoriteId,
          userId: dbUser._id,
        });
        if (!favorite) {
          return res
            .status(400)
            .json({ message: "favoriteId does not belong to user" });
        }
        validFavoriteId = favoriteId;
      }
    }

    const entry = await FoodEntry.create({
      userId: dbUser._id,
      favoriteId: validFavoriteId,
      date: parsedDate,
      time,
      name,
      calories: kcal,
      protein,
      fat,
      carbs,
      quantity,
      unit,
    });

    return res.status(201).json({ entry });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create food entry" });
  }
};

export const getFoodEntryById = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const entry = await FoodEntry.findOne({ _id: id, userId: dbUser._id });
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    return res.status(200).json({ entry });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch food entry" });
  }
};

export const updateFoodEntry = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const {
      date,
      time,
      name,
      calories,
      protein,
      fat,
      carbs,
      quantity,
      unit,
      favoriteId,
    } = req.body;

    if (!date || !time || !name || calories == null) {
      return res
        .status(400)
        .json({ message: "date, time, name, calories are required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const kcal = Number(calories);
    if (!Number.isFinite(kcal) || kcal <= 0) {
      return res.status(400).json({ message: "calories must be > 0" });
    }

    let favoriteField = {};
    if (favoriteId !== undefined) {
      if (!favoriteId) {
        favoriteField = { favoriteId: undefined };
      } else {
        if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
          return res.status(400).json({ message: "Invalid favoriteId" });
        }
        const favorite = await FoodFavorite.findOne({
          _id: favoriteId,
          userId: dbUser._id,
        });
        if (!favorite) {
          return res
            .status(400)
            .json({ message: "favoriteId does not belong to user" });
        }
        favoriteField = { favoriteId };
      }
    }

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: id, userId: dbUser._id },
      {
        $set: {
          date: parsedDate,
          time,
          name,
          calories: kcal,
          protein,
          fat,
          carbs,
          quantity,
          unit,
          ...favoriteField,
        },
      },
      { new: true, runValidators: true }
    );

    if (!entry) return res.status(404).json({ message: "Entry not found" });
    return res.status(200).json({ entry });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update food entry" });
  }
};

export const deleteFoodEntry = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const entry = await FoodEntry.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    return res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete food entry" });
  }
};

export const getFoodFavorites = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const favorites = await FoodFavorite.find({ userId: dbUser._id }).sort({
      name: 1,
    });
    return res.status(200).json({ favorites });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch favorites" });
  }
};

export const createFoodFavorite = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { name, calories, protein, fat, carbs, defaultQty, unit } = req.body;
    if (!name || calories == null) {
      return res
        .status(400)
        .json({ message: "name and calories are required" });
    }
    const kcal = Number(calories);
    if (!Number.isFinite(kcal) || kcal <= 0) {
      return res.status(400).json({ message: "calories must be > 0" });
    }

    const favorite = await FoodFavorite.create({
      userId: dbUser._id,
      name,
      calories: kcal,
      protein,
      fat,
      carbs,
      defaultQty,
      unit,
    });

    return res.status(201).json({ favorite });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create favorite" });
  }
};

export const deleteFoodFavorite = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const favorite = await FoodFavorite.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });
    if (!favorite)
      return res.status(404).json({ message: "Favorite not found" });

    return res.status(200).json({ message: "Favorite deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete favorite" });
  }
};
