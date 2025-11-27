import express from "express";

import { protect, requireTutor } from "../middleware/auth.middleware.js";
import Payment from "../models/Payment.js";
import TutorProfile from "../models/TutorProfile.js";

// TODO: matching
// TODO: payments
// TODO: receipts
// TODO: ads
// TODO: badges
// TODO: materials and subjects
// TODO: groups

const router = express.Router();

router.use(protect, requireTutor);

const pickProfileFields = (body = {}) => {
        const {
                specialties,
                subjects,
                levels,
                pricingMonthly,
                pricingSemester,
                bankNumber,
                subjectPricing,
        } = body;

        const normalizedSubjectPricing = Array.isArray(subjectPricing)
                ? subjectPricing
                          .filter((entry) => entry && entry.subject)
                          .map((entry) => ({
                                  subject: entry.subject,
                                  monthly: entry.monthly,
                                  semester: entry.semester,
                          }))
                : undefined;

        return {
                specialties: Array.isArray(specialties) ? specialties : [],
                subjects: Array.isArray(subjects) ? subjects : [],
                levels: Array.isArray(levels) ? levels : [],
                pricingMonthly,
                pricingSemester,
                bankNumber,
                subjectPricing: normalizedSubjectPricing,
        };
};

const computeTutorIncome = async (tutorId) => {
        // TODO: replace with aggregated payment analytics and time-based periods
        const payments = await Payment.find({ tutor: tutorId, isConfirmed: true });
        const total = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        // TODO: slice payments by month once date ranges are finalized
        return { incomeMonth: total, incomeTotal: total };
};

router.get("/profile", async (req, res) => {
        try {
                const profile = await TutorProfile.findOne({ userId: req.user._id })
                        .populate("specialties")
                        .populate("subjects")
                        .populate("teacherBadge")
                        .populate("subjectPricing.subject");

                if (!profile) {
                        return res.json(null);
                }

                return res.json(profile);
        } catch (error) {
                console.error("Error fetching tutor profile", error);
                return res.status(500).json({ message: "Failed to fetch tutor profile" });
        }
});

const upsertTutorProfile = async (req, res) => {
        try {
                if (req.user?.role !== "tutor") {
                        return res.status(403).json({ message: "Access denied - Tutors only" });
                }

                const payload = pickProfileFields(req.body);
                payload.userId = req.user._id;

                // TODO: validate majors/subjects/levels combos against catalogs once available
                // TODO: ensure subjectPricing subjects belong to tutor specialties or subject list

                let profile = await TutorProfile.findOne({ userId: req.user._id });
                const isNew = !profile;

                if (profile) {
                        Object.assign(profile, payload);
                        await profile.save();
                } else {
                        profile = await TutorProfile.create(payload);
                }

                const populated = await TutorProfile.findById(profile._id)
                        .populate("specialties")
                        .populate("subjects")
                        .populate("teacherBadge")
                        .populate("subjectPricing.subject");

                // TODO: keep income in sync with confirmed payments instead of manual fields
                return res.status(isNew ? 201 : 200).json(populated);
        } catch (error) {
                console.error("Error saving tutor profile", error);
                return res.status(500).json({ message: "Failed to save tutor profile" });
        }
};

router.post("/profile", upsertTutorProfile);
router.put("/profile", upsertTutorProfile);

router.get("/income/refresh", async (req, res) => {
        try {
                const profile = await TutorProfile.findOne({ userId: req.user._id });

                if (!profile) {
                        return res.status(404).json({ message: "Tutor profile not found" });
                }

                const { incomeMonth, incomeTotal } = await computeTutorIncome(req.user._id);
                profile.incomeMonth = incomeMonth;
                profile.incomeTotal = incomeTotal;
                await profile.save();

                return res.json({ incomeMonth, incomeTotal });
        } catch (error) {
                console.error("Error refreshing tutor income", error);
                return res.status(500).json({ message: "Failed to refresh tutor income" });
        }
});

export default router;
