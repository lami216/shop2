import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major",
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    levels: [
      {
        type: String,
        trim: true,
      },
    ],
    subjectPricing: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        monthly: Number,
        semester: Number,
      },
    ],
    pricingMonthly: {
      type: Number,
    },
    pricingSemester: {
      type: Number,
    },
    // TODO: prefer subjectPricing once catalogs are wired; keep these as general fallbacks for now
    bankNumber: {
      type: String,
      trim: true,
    },
    teacherBadge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
    subscriptionRate: {
      type: Number,
      default: null,
    },
    incomeMonth: {
      type: Number,
      default: 0,
    },
    incomeTotal: {
      type: Number,
    },
    // TODO: compute incomes from confirmed payments instead of manual values
    // TODO: subscriptionRate will feed billing logic later; keep informational for now
    // TODO: integrate payment disbursement tracking and payout schedules
    activeLessons: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        period: { type: String, trim: true },
        payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        // TODO: add meeting cadence and lesson status
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TutorProfile = mongoose.model("TutorProfile", tutorProfileSchema);

export default TutorProfile;
