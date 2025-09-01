import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import FoodEntry from "../models/foodEntry.model.js";
import WeightLog from "../models/weightLog.model.js";
import Goal from "../models/goal.model.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const getDailySummary = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const entries = await FoodEntry.find({
      userId: dbUser._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const consumed = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const protein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
    const fat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);
    const carbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);

    // current goal (no endDate or latest start)
    const currentGoal = await Goal.findOne({
      userId: dbUser._id,
      $or: [{ endDate: { $exists: false } }, { endDate: null }],
    }).sort({ startDate: -1 });

    const targetDailyCalories = currentGoal?.targetDailyCalories || null;

    return res.status(200).json({
      consumed,
      targetDailyCalories,
      macros: { protein, fat, carbs },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get daily summary" });
  }
};

export const getWeeklySummary = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const start = startOfDay(daysAgo(6));
    const end = endOfDay(new Date());

    const entries = await FoodEntry.find({
      userId: dbUser._id,
      date: { $gte: start, $lte: end },
    });

    // group by date (yyyy-mm-dd)
    const byDay = new Map();
    for (const e of entries) {
      const key = new Date(e.date).toISOString().slice(0, 10);
      const prev = byDay.get(key) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };
      prev.calories += e.calories || 0;
      prev.protein += e.protein || 0;
      prev.fat += e.fat || 0;
      prev.carbs += e.carbs || 0;
      byDay.set(key, prev);
    }

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      const agg = byDay.get(key) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };
      days.push({ date: key, ...agg });
    }

    const totalCalories = days.reduce((s, d) => s + d.calories, 0);
    const avgCalories = Math.round(totalCalories / 7);

    return res.status(200).json({ days, totalCalories, avgCalories });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get weekly summary" });
  }
};

export const getFoodMacroDistribution = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const start = startOfDay(daysAgo(6));
    const end = endOfDay(new Date());

    const entries = await FoodEntry.find({
      userId: dbUser._id,
      date: { $gte: start, $lte: end },
    });

    const protein = entries.reduce((s, e) => s + (e.protein || 0), 0);
    const fat = entries.reduce((s, e) => s + (e.fat || 0), 0);
    const carbs = entries.reduce((s, e) => s + (e.carbs || 0), 0);

    return res.status(200).json({ protein, fat, carbs });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to get macro distribution" });
  }
};

export const getWeightProgress = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { range } = req.query; // '1w' | '1m' | '3m'
    const now = new Date();
    let start = new Date();
    if (range === "1w") start = daysAgo(7);
    else if (range === "3m") {
      start = new Date(now);
      start.setMonth(now.getMonth() - 3);
    } else {
      // default 1m
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
    }

    const logs = await WeightLog.find({
      userId: dbUser._id,
      date: { $gte: start, $lte: now },
    }).sort({ date: 1 });

    return res.status(200).json({ logs });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get weight progress" });
  }
};
