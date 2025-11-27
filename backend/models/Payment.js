import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    amount: {
      type: Number,
    },
    period: {
      type: String,
      enum: ["monthly", "semester"],
    },
    periodStart: {
      type: Date,
      // TODO: compute automatically based on subscription type and confirmation date
    },
    periodEnd: {
      type: Date,
      // TODO: compute automatically based on subscription type and confirmation date
    },
    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_receipt",
        "awaiting_tutor_confirmation",
        "confirmed",
        "rejected",
      ],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
    },
    receiptImage: {
      type: String,
      trim: true,
      // TODO: integrate with file storage or upload service
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    // TODO: integrate payment gateway or manual verification checks
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
