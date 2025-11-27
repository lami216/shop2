import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      trim: true,
    },
    major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Major",
    },
    level: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
