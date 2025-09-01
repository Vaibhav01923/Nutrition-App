import mongoose from "mongoose";

const weeklySummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStart: { type: Date, required: true },
    totalCalories: { type: Number, required: true },
    avgCalories: { type: Number, required: true },
    protein: { type: Number },
    fat: { type: Number },
    carbs: { type: Number },
    entriesCount: { type: Number, required: true },
  },
  { timestamps: true }
);

const WeeklySummary = mongoose.model("WeeklySummary", weeklySummarySchema);

export default WeeklySummary;
