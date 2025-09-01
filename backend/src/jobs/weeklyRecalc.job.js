import User from "../models/user.model.js";
import FoodEntry from "../models/foodEntry.model.js";
import WeightLog from "../models/weightLog.model.js";
import Goal from "../models/goal.model.js";
import MaintenanceHistory from "../models/maintenanceHistory.model.js";
import { impliedMaintenance } from "../services/maintenance.service.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export async function recalcForLastWeek() {
  const now = new Date();
  // last full week: Monday..Sunday ending yesterday
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const yesterday = addDays(startOfDay(now), -1);
  // find last Monday
  const offsetToMonday = (yesterday.getDay() + 6) % 7; // Mon=0
  const weekStart = addDays(yesterday, -offsetToMonday);
  const weekEnd = addDays(weekStart, 6);

  const users = await User.find({}).select("_id");

  for (const u of users) {
    const entries = await FoodEntry.find({
      userId: u._id,
      date: { $gte: weekStart, $lte: weekEnd },
    });
    const totalIntake = entries.reduce((s, e) => s + (e.calories || 0), 0);
    const avgIntake = Math.round(totalIntake / 7);

    const startWeightLog = await WeightLog.findOne({
      userId: u._id,
      date: { $gte: weekStart, $lte: addDays(weekStart, 0) },
    }).sort({ date: 1 });
    const endWeightLog = await WeightLog.findOne({
      userId: u._id,
      date: { $gte: weekEnd, $lte: addDays(weekEnd, 0) },
    }).sort({ date: -1 });

    if (!startWeightLog || !endWeightLog) continue; // skip if missing weights

    const deltaKg =
      (endWeightLog.weightKg || 0) - (startWeightLog.weightKg || 0);
    const maintenance = impliedMaintenance(avgIntake, deltaKg);

    await MaintenanceHistory.create({
      userId: u._id,
      weekStart,
      weekEnd,
      avgIntake,
      weightStartKg: startWeightLog.weightKg,
      weightEndKg: endWeightLog.weightKg,
      impliedMaintenance: maintenance,
    });

    // update active goal targetDailyCalories if exists
    const activeGoal = await Goal.findOne({
      userId: u._id,
      $or: [{ endDate: { $exists: false } }, { endDate: null }],
    }).sort({ startDate: -1 });
    if (activeGoal) {
      const weekly = activeGoal.weeklyChangeKg || 0;
      const dailyAdj = (weekly * 7700) / 7;
      activeGoal.targetDailyCalories = Math.round(maintenance + dailyAdj);
      await activeGoal.save();
    }
  }
}
