import express from "express";
import {
        createCollege,
        deleteCollege,
        getAllColleges,
        updateCollege,
        createMajor,
        deleteMajor,
        getMajorsByCollege,
        updateMajor,
        createSubject,
        deleteSubject,
        getSubjectsByMajor,
        updateSubject,
        getMoltaqaStructure,
} from "../controllers/moltaqaAdmin.controller.js";
import { adminRoute } from "../middleware/admin.middleware.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute, adminRoute);

router.get("/admin/structure", getMoltaqaStructure);

router.post("/admin/colleges", createCollege);
router.get("/admin/colleges", getAllColleges);
router.patch("/admin/colleges/:id", updateCollege);
router.delete("/admin/colleges/:id", deleteCollege);

router.post("/admin/majors", createMajor);
router.get("/admin/majors/:collegeId", getMajorsByCollege);
router.patch("/admin/majors/:id", updateMajor);
router.delete("/admin/majors/:id", deleteMajor);

router.post("/admin/subjects", createSubject);
router.get("/admin/subjects/:majorId", getSubjectsByMajor);
router.patch("/admin/subjects/:id", updateSubject);
router.delete("/admin/subjects/:id", deleteSubject);

export default router;
