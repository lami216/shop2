import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    monthValue: {
      type: Number,
    },
    tier: {
      type: String,
      enum: ["gold", "emerald", "diamond"],
    },
    thresholdReached: {
      type: Boolean,
      default: false,
    },
    // TODO: add subscription period tracking and tier calculation logic
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
