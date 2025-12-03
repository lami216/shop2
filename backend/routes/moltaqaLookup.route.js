import express from "express";
import {
        getColleges,
        getMajors,
        getSubjects,
} from "../controllers/moltaqaLookup.controller.js";

const router = express.Router();

router.get("/colleges", getColleges);
router.get("/majors", getMajors);
router.get("/subjects", getSubjects);

export default router;
