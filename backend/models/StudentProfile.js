import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Major",
    },
    level: {
      type: String,
      trim: true,
    },
    currentSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    statusForPartners: {
      type: String,
      trim: true,
    },
    statusForHelp: {
      type: String,
      trim: true,
    },
    studyTimes: [
      {
        type: String,
        trim: true,
      },
    ],
    activeLessons: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        period: { type: String, trim: true },
        payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        // TODO: extend with schedule windows and lesson status tracking
      },
    ],
    // TODO: add ad posting preferences, matching flags, and collaboration history
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
