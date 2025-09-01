import User from "../models/user.model.js";
import Goal from "../models/goal.model.js";
import FoodEntry from "../models/foodEntry.model.js";
import FoodFavorite from "../models/foodFavorite.model.js";
import WeightLog from "../models/weightLog.model.js";
import WeeklySummary from "../models/weeklySummary.model.js";
import MaintenanceHistory from "../models/maintenanceHistory.model.js";
import { getAuth } from "@clerk/express";

export const getUserById = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user", error });
  }
};

export const getUserGoals = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const goals = await Goal.find({ userId: dbUser._id });
    res.status(200).send(goals);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user goals", error });
  }
};

export const getUserFoodEntries = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const foodEntries = await FoodEntry.find({ userId: dbUser._id });
    res.status(200).send(foodEntries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user food entries", error });
  }
};

export const getUserFoodFavorites = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const foodFavorites = await FoodFavorite.find({ userId: dbUser._id });
    res.status(200).send(foodFavorites);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user food favorites", error });
  }
};

export const getUserWeightLogs = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const weightLogs = await WeightLog.find({ userId: dbUser._id });
    res.status(200).send(weightLogs);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user weight logs", error });
  }
};

export const getUserWeeklySummaries = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const weeklySummaries = await WeeklySummary.find({ userId: dbUser._id });
    res.status(200).send(weeklySummaries);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user weekly summaries", error });
  }
};

export const getUserMaintenanceHistories = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const maintenanceHistories = await MaintenanceHistory.find({
      userId: dbUser._id,
    });
    res.status(200).send(maintenanceHistories);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user maintenance histories", error });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId }).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user profile", error });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).send({ message: "Error updating user profile", error });
  }
};
