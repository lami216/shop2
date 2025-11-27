import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    incomeMin: {
      type: Number,
    },
    incomeMax: {
      type: Number,
    },
    // TODO: seed Gold, Emerald, Diamond in admin tooling
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
