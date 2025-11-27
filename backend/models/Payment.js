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
    receiptImage: {
      type: String,
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    // TODO: integrate payment gateway or manual verification checks
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
