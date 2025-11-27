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
    pricingMonthly: {
      type: Number,
    },
    pricingSemester: {
      type: Number,
    },
    bankNumber: {
      type: String,
      trim: true,
    },
    teacherBadge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
    incomeMonth: {
      type: Number,
      default: 0,
    },
    incomeTotal: {
      type: Number,
    },
    // TODO: integrate payment disbursement tracking and payout schedules
  },
  {
    timestamps: true,
  }
);

const TutorProfile = mongoose.model("TutorProfile", tutorProfileSchema);

export default TutorProfile;
