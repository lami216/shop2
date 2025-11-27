import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    adType: {
      type: String,
      enum: ["partner", "group", "tutor", "help"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    description: {
      type: String,
      trim: true,
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      // Flexible settings based on ad type
    },
    status: {
      type: String,
      trim: true,
    },
    // TODO: add matching rules, filters, and lifecycle tracking
  },
  {
    timestamps: true,
  }
);

const Ad = mongoose.model("Ad", adSchema);

export default Ad;
