import mongoose from "mongoose";

const weightLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    weightKg: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

weightLogSchema.index({ userId: 1, date: -1 });

const WeightLog = mongoose.model("WeightLog", weightLogSchema);

export default WeightLog;
