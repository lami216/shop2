import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createOrUpdateStudentProfile, getMyStudentProfile, publicGetStudentProfile } from "../controllers/studentProfile.controller.js";

const router = express.Router();

router.get("/me", protectRoute, getMyStudentProfile);
router.post("/me", protectRoute, createOrUpdateStudentProfile);
router.get("/:userId", publicGetStudentProfile);

export default router;
