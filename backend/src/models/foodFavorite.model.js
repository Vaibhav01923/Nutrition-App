import mongoose from "mongoose";

const foodFavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },
    fat: { type: Number },
    carbs: { type: Number },
    defaultQty: { type: Number },
    unit: { type: String },
  },
  { timestamps: true }
);

const FoodFavorite = mongoose.model("FoodFavorite", foodFavoriteSchema);

export default FoodFavorite;
