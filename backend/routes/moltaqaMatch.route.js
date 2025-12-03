import express from "express";
import {
  searchStudentMatches,
  getStudentPreview,
} from "../controllers/moltaqaMatch.controller.js";

const router = express.Router();

// POST search with filters (subject, major, level, studyModes)
router.post("/search", searchStudentMatches);

// GET a simple preview list of visible profiles
router.get("/search/preview", getStudentPreview);

export default router;
