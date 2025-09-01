import mongoose from "mongoose";

const maintenanceHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    avgIntake: { type: Number, required: true }, // kcal/day
    weightStartKg: { type: Number, required: true },
    weightEndKg: { type: Number, required: true },
    impliedMaintenance: { type: Number, required: true }, // kcal/day (computed)
  },
  { timestamps: true }
);

maintenanceHistorySchema.index({ userId: 1, weekStart: -1 });

const MaintenanceHistory = mongoose.model(
  "MaintenanceHistory",
  maintenanceHistorySchema
);

export default MaintenanceHistory;
