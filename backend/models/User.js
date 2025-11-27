import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // TODO: hash password before saving during authentication setup
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
    },
    language: {
      type: String,
      enum: ["ar", "fr"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
    },
    tutorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutorProfile",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
