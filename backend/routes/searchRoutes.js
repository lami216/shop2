import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import {
  findGroupCandidates,
  findHelpCandidates,
  findPartnerCandidates,
  findSubjectById,
  findTutorCandidates,
} from "../services/matchingService.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK");
});

router.post("/match", protect, async (req, res) => {
  try {
    const { subjectId, searchType, mode } = req.body || {};

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    if (!searchType || !["partner", "group", "tutor", "help"].includes(searchType)) {
      return res.status(400).json({ message: "Invalid searchType" });
    }

    const subject = await findSubjectById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const user = await User.findById(req.user?._id).populate({
      path: "studentProfile",
    });

    if (!user?.studentProfile) {
      return res.status(400).json({ message: "Student profile is required for matching" });
    }

    const studentProfile = await StudentProfile.findById(user.studentProfile);
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const studentPreferredMode = mode || req.body?.preferredMode || "both"; // TODO: unify study mode preference storage

    let results = [];

    if (searchType === "partner") {
      results = await findPartnerCandidates({
        student: user,
        studentProfile,
        subject,
        studentPreferredMode,
      });
    }

    if (searchType === "group") {
      results = await findGroupCandidates({
        student: user,
        studentProfile,
        subject,
        studentPreferredMode,
      });
    }

    if (searchType === "tutor") {
      results = await findTutorCandidates({
        studentProfile,
        subject,
        studentPreferredMode,
      });
    }

    if (searchType === "help") {
      results = await findHelpCandidates({
        student: user,
        studentProfile,
        subject,
        studentPreferredMode,
      });
    }

    // TODO: support pagination and additional filters like badge preferences or online-only
    return res.json({ subjectId, searchType, results });
  } catch (error) {
    console.error("Error in /api/search/match", error?.message || error);
    return res.status(500).json({ message: "Failed to run matching" });
  }
});

export default router;
