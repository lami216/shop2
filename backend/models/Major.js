import mongoose from "mongoose";

const majorSchema = new mongoose.Schema(
  {
    majorName: {
      type: String,
      trim: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
  },
  {
    timestamps: true,
  }
);

const Major = mongoose.model("Major", majorSchema);

export default Major;
