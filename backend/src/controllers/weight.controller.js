import { getAuth } from "@clerk/express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import WeightLog from "../models/weightLog.model.js";

export const getWeightLogs = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { month } = req.query; // YYYY-MM
    const filter = { userId: dbUser._id };
    if (month) {
      const [year, m] = month.split("-").map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const logs = await WeightLog.find(filter).sort({ date: -1 });
    return res.status(200).json({ logs });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch weight logs" });
  }
};

export const createWeightLog = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { date, weightKg, note } = req.body;
    if (!date || weightKg == null) {
      return res
        .status(400)
        .json({ message: "date and weightKg are required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      return res.status(400).json({ message: "weightKg must be > 0" });
    }

    const log = await WeightLog.create({
      userId: dbUser._id,
      date: parsedDate,
      weightKg: weight,
      note,
    });
    return res.status(201).json({ log });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create weight log" });
  }
};

export const getWeightLogById = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const log = await WeightLog.findOne({ _id: id, userId: dbUser._id });
    if (!log) return res.status(404).json({ message: "Weight log not found" });
    return res.status(200).json({ log });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch weight log" });
  }
};

export const updateWeightLog = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { date, weightKg, note } = req.body;
    const updates = {};
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date" });
      }
      updates.date = parsedDate;
    }
    if (weightKg !== undefined) {
      const weight = Number(weightKg);
      if (!Number.isFinite(weight) || weight <= 0) {
        return res.status(400).json({ message: "weightKg must be > 0" });
      }
      updates.weightKg = weight;
    }
    if (note !== undefined) updates.note = note;

    const log = await WeightLog.findOneAndUpdate(
      { _id: id, userId: dbUser._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!log) return res.status(404).json({ message: "Weight log not found" });
    return res.status(200).json({ log });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update weight log" });
  }
};

export const deleteWeightLog = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbUser = await User.findOne({ clerkId: userId }).select("_id");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const log = await WeightLog.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });
    if (!log) return res.status(404).json({ message: "Weight log not found" });

    return res.status(200).json({ message: "Weight log deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete weight log" });
  }
};
