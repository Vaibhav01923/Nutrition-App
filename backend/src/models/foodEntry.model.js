import mongoose from "mongoose";

const foodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    favoriteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodFavorite",
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "13:05"
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },
    fat: { type: Number },
    carbs: { type: Number },
    quantity: { type: Number },
    unit: { type: String },
  },
  { timestamps: true }
);

foodEntrySchema.index({ userId: 1, date: -1 });

const FoodEntry = mongoose.model("FoodEntry", foodEntrySchema);

export default FoodEntry;
