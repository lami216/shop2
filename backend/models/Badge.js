import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    color: {
      type: String,
      trim: true,
      required: true,
    },
    icon: {
      type: String,
      trim: true,
      required: true,
    },
    incomeMin: {
      type: Number,
      required: true,
    },
    incomeMax: {
      type: Number,
      default: null,
    },
    subscriptionRate: {
      type: Number,
      required: true,
    },
    // TODO: expand badge metadata (descriptions, localization, perks) later
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
