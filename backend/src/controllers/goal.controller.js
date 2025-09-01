import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Goal from "../models/goal.model.js";

export const getGoals = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const goals = await Goal.find({ userId: dbUser._id }).sort({
      startDate: -1,
    });
    return res.status(200).json({ goals });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { mode, weeklyChangeKg, startDate, endDate, targetDailyCalories } =
      req.body;

    const validModes = ["lose", "gain", "maintain"];
    if (!mode || !validModes.includes(mode)) {
      return res
        .status(400)
        .json({ message: "mode must be one of lose|gain|maintain" });
    }

    const start = startDate ? new Date(startDate) : new Date();
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid startDate" });
    }

    let end;
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        end = undefined;
      } else {
        const parsed = new Date(endDate);
        if (Number.isNaN(parsed.getTime())) {
          return res.status(400).json({ message: "Invalid endDate" });
        }
        end = parsed;
      }
    }

    let weekly = weeklyChangeKg;
    if (weekly !== undefined) {
      weekly = Number(weekly);
      if (!Number.isFinite(weekly)) {
        return res
          .status(400)
          .json({ message: "weeklyChangeKg must be a number" });
      }
    }

    let target = targetDailyCalories;
    if (target !== undefined) {
      target = Number(target);
      if (!Number.isFinite(target) || target <= 0) {
        return res
          .status(400)
          .json({ message: "targetDailyCalories must be > 0" });
      }
    }

    const goal = await Goal.create({
      userId: dbUser._id,
      mode,
      weeklyChangeKg: weekly,
      startDate: start,
      endDate: end,
      targetDailyCalories: target,
    });

    return res.status(201).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create goal" });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const goal = await Goal.findOne({ _id: id, userId: dbUser._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    return res.status(200).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch goal" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { mode, weeklyChangeKg, startDate, endDate, targetDailyCalories } =
      req.body;

    const updates = {};

    if (mode !== undefined) {
      const validModes = ["lose", "gain", "maintain"];
      if (!validModes.includes(mode)) {
        return res
          .status(400)
          .json({ message: "mode must be one of lose|gain|maintain" });
      }
      updates.mode = mode;
    }

    if (weeklyChangeKg !== undefined) {
      const weekly = Number(weeklyChangeKg);
      if (!Number.isFinite(weekly)) {
        return res
          .status(400)
          .json({ message: "weeklyChangeKg must be a number" });
      }
      updates.weeklyChangeKg = weekly;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid startDate" });
      }
      updates.startDate = start;
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        updates.endDate = undefined;
      } else {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({ message: "Invalid endDate" });
        }
        updates.endDate = end;
      }
    }

    if (targetDailyCalories !== undefined) {
      const target = Number(targetDailyCalories);
      if (!Number.isFinite(target) || target <= 0) {
        return res
          .status(400)
          .json({ message: "targetDailyCalories must be > 0" });
      }
      updates.targetDailyCalories = target;
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: dbUser._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!goal) return res.status(404).json({ message: "Goal not found" });
    return res.status(200).json({ goal });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update goal" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const goal = await Goal.findOneAndDelete({ _id: id, userId: dbUser._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    return res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete goal" });
  }
};
