import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subjectsIncluded: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    maxMembers: {
      type: Number,
    },
    mode: {
      type: String,
      enum: ["online", "offline", "both"],
    },
    description: {
      type: String,
      trim: true,
    },
    // TODO: attach group advertisement references and promotional settings
  },
  {
    timestamps: true,
  }
);

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);

export default StudyGroup;
