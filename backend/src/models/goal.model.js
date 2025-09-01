import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: { type: String, enum: ["lose", "gain", "maintain"], required: true },
    weeklyChangeKg: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    targetDailyCalories: { type: Number },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
