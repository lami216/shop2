import express from "express";

import { protect, requireAdmin } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import TutorProfile from "../models/TutorProfile.js";
import Ad from "../models/Ad.js";
import Payment from "../models/Payment.js";
import Badge from "../models/Badge.js";
import College from "../models/College.js";
import Major from "../models/Major.js";
import Subject from "../models/Subject.js";
import StudyGroup from "../models/StudyGroup.js";
import { getAllBadges } from "../services/badgeService.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", (req, res) => {
        res.json({ status: "ok", user: req.user });
});

router.get("/overview", async (req, res) => {
        try {
                const [students, tutors, admins, totalUsers, studyGroups, adStats, paymentStats, tutorBadgeStats] =
                        await Promise.all([
                                User.countDocuments({ role: "student" }),
                                User.countDocuments({ role: "tutor" }),
                                User.countDocuments({ role: "admin" }),
                                User.countDocuments({}),
                                StudyGroup.countDocuments({}),
                                Ad.aggregate([
                                        { $group: { _id: "$adType", count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } } } },
                                ]),
                                Payment.aggregate([
                                        {
                                                $group: {
                                                        _id: "$isConfirmed",
                                                        count: { $sum: 1 },
                                                        totalAmount: { $sum: "$amount" },
                                                },
                                        },
                                ]),
                                TutorProfile.aggregate([
                                        {
                                                $group: {
                                                        _id: "$teacherBadge",
                                                        count: { $sum: 1 },
                                                },
                                        },
                                ]),
                        ]);

                const paymentSummary = paymentStats.reduce(
                        (acc, stat) => {
                                if (stat._id === true) {
                                        acc.confirmedCount = stat.count;
                                        acc.confirmedAmount = stat.totalAmount || 0;
                                } else {
                                        acc.unconfirmedCount += stat.count;
                                }
                                return acc;
                        },
                        { confirmedCount: 0, confirmedAmount: 0, unconfirmedCount: 0 }
                );

                const badgeCounts = await Badge.populate(
                        tutorBadgeStats.map((stat) => ({ ...stat, badge: stat._id })),
                        { path: "badge", select: "name color icon" }
                );

                res.json({
                        users: { total: totalUsers, students, tutors, admins },
                        studyGroups,
                        ads: adStats.map((stat) => ({ adType: stat._id, total: stat.count, active: stat.active })),
                        payments: paymentSummary,
                        tutorsByBadge: badgeCounts.map((stat) => ({
                                badge: stat.badge?.name || "unassigned",
                                count: stat.count,
                        })),
                });
        } catch (error) {
                console.error("Failed to build admin overview", error?.message || error);
                res.status(500).json({ message: "Failed to load overview" });
        }
});

router.get("/users", async (req, res) => {
        try {
                        // TODO: paginate admin user listing once UI adds paging controls
                const { role, search, limit = 50 } = req.query;
                const filter = {};

                if (role) {
                        filter.role = role;
                }

                if (search) {
                        filter.$or = [
                                { name: { $regex: search, $options: "i" } },
                                { email: { $regex: search, $options: "i" } },
                        ];
                }

                const users = await User.find(filter)
                        .select("name email role isActive createdAt")
                        .sort({ createdAt: -1 })
                        .limit(Number(limit));

                res.json(users);
        } catch (error) {
                console.error("Failed to fetch users", error?.message || error);
                res.status(500).json({ message: "Failed to fetch users" });
        }
});

router.patch("/users/:id", async (req, res) => {
        try {
                const { id } = req.params;
                const { isActive, role } = req.body;
                const allowedRoles = ["student", "tutor", "admin"];

                const user = await User.findById(id);

                if (!user) {
                        return res.status(404).json({ message: "User not found" });
                }

                if (role && !allowedRoles.includes(role)) {
                        return res.status(400).json({ message: "Invalid role" });
                }

                if (user.role === "admin" && role && role !== "admin") {
                        const adminCount = await User.countDocuments({ role: "admin" });
                        if (adminCount <= 1) {
                                return res.status(400).json({ message: "Cannot remove the last admin" });
                        }
                }

                if (typeof isActive === "boolean") {
                        user.isActive = isActive;
                }

                if (role) {
                        user.role = role;
                }

                await user.save();

                res.json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive,
                        createdAt: user.createdAt,
                });
        } catch (error) {
                console.error("Failed to update user", error?.message || error);
                res.status(500).json({ message: "Failed to update user" });
        }
});

router.get("/tutors", async (req, res) => {
        try {
                const { badge } = req.query;
                const filter = {};

                if (badge) {
                        const badgeDoc = await Badge.findOne({ name: badge.toLowerCase() });
                        if (badgeDoc) {
                                filter.teacherBadge = badgeDoc._id;
                        } else {
                                return res.json([]);
                        }
                }

                const tutors = await TutorProfile.find(filter)
                        .populate({ path: "userId", select: "name email role isActive" })
                        .populate({ path: "teacherBadge", select: "name color icon incomeMin incomeMax subscriptionRate" })
                        .sort({ createdAt: -1 });

                res.json(
                        tutors.map((tutor) => ({
                                _id: tutor._id,
                                userId: tutor.userId?._id,
                                name: tutor.userId?.name,
                                email: tutor.userId?.email,
                                badge: tutor.teacherBadge,
                                incomeMonth: tutor.incomeMonth,
                                incomeTotal: tutor.incomeTotal,
                                activeLessons: tutor.activeLessons?.length || 0,
                        }))
                );
        } catch (error) {
                console.error("Failed to fetch tutors", error?.message || error);
                res.status(500).json({ message: "Failed to fetch tutors" });
        }
});

router.get("/tutors/:id", async (req, res) => {
        try {
                const { id } = req.params;
                const tutor = await TutorProfile.findById(id)
                        .populate({ path: "userId", select: "name email role" })
                        .populate({ path: "teacherBadge", select: "name color icon incomeMin incomeMax subscriptionRate" })
                        .populate({ path: "specialties", select: "majorName" })
                        .populate({ path: "subjects", select: "subjectName level" })
                        .populate({ path: "subjectPricing.subject", select: "subjectName level" });

                if (!tutor) {
                        return res.status(404).json({ message: "Tutor not found" });
                }

                res.json(tutor);
        } catch (error) {
                console.error("Failed to fetch tutor detail", error?.message || error);
                res.status(500).json({ message: "Failed to fetch tutor" });
        }
});

router.get("/ads", async (req, res) => {
        try {
                        // TODO: paginate ads list when admin UI grows
                const { type, status, limit = 50 } = req.query;
                const filter = {};

                if (type) {
                        filter.adType = type;
                }

                if (status) {
                        filter.status = status;
                }

                const ads = await Ad.find(filter)
                        .populate({ path: "creator", select: "name role" })
                        .populate({ path: "subject", select: "subjectName" })
                        .sort({ createdAt: -1 })
                        .limit(Number(limit));

                res.json(ads);
        } catch (error) {
                console.error("Failed to fetch ads", error?.message || error);
                res.status(500).json({ message: "Failed to fetch ads" });
        }
});

router.patch("/ads/:id", async (req, res) => {
        try {
                const { id } = req.params;
                const { status } = req.body;
                const allowedStatuses = ["active", "archived", "blocked", "pending"];

                if (status && !allowedStatuses.includes(status)) {
                        return res.status(400).json({ message: "Invalid status" });
                }

                const updated = await Ad.findByIdAndUpdate(
                        id,
                        { $set: { status } },
                        { new: true }
                )
                        .populate({ path: "creator", select: "name role" })
                        .populate({ path: "subject", select: "subjectName" });

                if (!updated) {
                        return res.status(404).json({ message: "Ad not found" });
                }

                res.json(updated);
        } catch (error) {
                console.error("Failed to update ad", error?.message || error);
                res.status(500).json({ message: "Failed to update ad" });
        }
});

router.get("/payments", async (req, res) => {
        try {
                        // TODO: paginate payments for long history
                const { status, tutorId, studentId, limit = 50 } = req.query;
                const filter = {};

                if (status) filter.status = status;
                if (tutorId) filter.tutor = tutorId;
                if (studentId) filter.student = studentId;

                const payments = await Payment.find(filter)
                        .populate({ path: "student", select: "name email" })
                        .populate({ path: "tutor", select: "name email" })
                        .populate({ path: "subject", select: "subjectName" })
                        .sort({ createdAt: -1 })
                        .limit(Number(limit));

                res.json(payments);
        } catch (error) {
                console.error("Failed to fetch payments", error?.message || error);
                res.status(500).json({ message: "Failed to fetch payments" });
        }
});

router.patch("/payments/:id", async (req, res) => {
        try {
                const { id } = req.params;
                const { status, isConfirmed } = req.body;
                const allowedStatuses = [
                        "pending",
                        "awaiting_receipt",
                        "awaiting_tutor_confirmation",
                        "confirmed",
                        "rejected",
                ];

                if (status && !allowedStatuses.includes(status)) {
                        return res.status(400).json({ message: "Invalid status" });
                }

                const updates = {};
                if (status) updates.status = status;
                if (typeof isConfirmed === "boolean") updates.isConfirmed = isConfirmed;
                // TODO: add audit log for manual corrections

                const updated = await Payment.findByIdAndUpdate(id, { $set: updates }, { new: true })
                        .populate({ path: "student", select: "name email" })
                        .populate({ path: "tutor", select: "name email" })
                        .populate({ path: "subject", select: "subjectName" });

                if (!updated) {
                        return res.status(404).json({ message: "Payment not found" });
                }

                res.json(updated);
        } catch (error) {
                console.error("Failed to update payment", error?.message || error);
                res.status(500).json({ message: "Failed to update payment" });
        }
});

router.get("/colleges", async (_req, res) => {
        try {
                const colleges = await College.find({}).sort({ collegeName: 1 });
                res.json(colleges);
        } catch (error) {
                console.error("Failed to fetch colleges", error?.message || error);
                res.status(500).json({ message: "Failed to fetch colleges" });
        }
});

router.post("/colleges", async (req, res) => {
        try {
                const { collegeName } = req.body;
                if (!collegeName) {
                        return res.status(400).json({ message: "College name is required" });
                }

                const college = await College.create({ collegeName });
                res.status(201).json(college);
        } catch (error) {
                console.error("Failed to create college", error?.message || error);
                res.status(500).json({ message: "Failed to create college" });
        }
});

router.get("/majors", async (_req, res) => {
        try {
                const majors = await Major.find({}).populate({ path: "college", select: "collegeName" });
                res.json(majors);
        } catch (error) {
                console.error("Failed to fetch majors", error?.message || error);
                res.status(500).json({ message: "Failed to fetch majors" });
        }
});

router.post("/majors", async (req, res) => {
        try {
                const { majorName, college } = req.body;

                if (!majorName || !college) {
                        return res.status(400).json({ message: "Major name and college are required" });
                }

                const major = await Major.create({ majorName, college });
                res.status(201).json(major);
        } catch (error) {
                console.error("Failed to create major", error?.message || error);
                res.status(500).json({ message: "Failed to create major" });
        }
});

router.get("/subjects", async (_req, res) => {
        try {
                const subjects = await Subject.find({})
                        .populate({ path: "major", select: "majorName" })
                        .sort({ subjectName: 1 });
                res.json(subjects);
        } catch (error) {
                console.error("Failed to fetch subjects", error?.message || error);
                res.status(500).json({ message: "Failed to fetch subjects" });
        }
});

router.post("/subjects", async (req, res) => {
        try {
                const { subjectName, major, level } = req.body;

                if (!subjectName || !major) {
                        return res.status(400).json({ message: "Subject name and major are required" });
                }

                const subject = await Subject.create({ subjectName, major, level });
                res.status(201).json(subject);
        } catch (error) {
                console.error("Failed to create subject", error?.message || error);
                res.status(500).json({ message: "Failed to create subject" });
        }
});

router.get("/badges", async (_req, res) => {
        try {
                const badges = await getAllBadges();
                return res.json(badges);
        } catch (error) {
                console.error("Failed to fetch badges", error?.message || error);
                return res.status(500).json({ message: "Could not fetch badges" });
        }
});

router.patch("/badges/:id", async (req, res) => {
        try {
                const { id } = req.params;
                const { incomeMin, incomeMax, subscriptionRate } = req.body;

                const updates = {};
                if (incomeMin !== undefined) updates.incomeMin = incomeMin;
                if (incomeMax !== undefined) updates.incomeMax = incomeMax;
                if (subscriptionRate !== undefined) updates.subscriptionRate = subscriptionRate;
                // TODO: recalculate tutor badges when ranges change

                const badge = await Badge.findByIdAndUpdate(id, { $set: updates }, { new: true });

                if (!badge) {
                        return res.status(404).json({ message: "Badge not found" });
                }

                res.json(badge);
        } catch (error) {
                console.error("Failed to update badge", error?.message || error);
                res.status(500).json({ message: "Failed to update badge" });
        }
});

export default router;
