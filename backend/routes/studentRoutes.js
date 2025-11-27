import express from "express";

import { protect, requireStudent } from "../middleware/auth.middleware.js";
import Ad from "../models/Ad.js";
import StudentProfile from "../models/StudentProfile.js";

const router = express.Router();

router.use(protect, requireStudent);

// Student profile routes
router.get("/profile", async (req, res) => {
        try {
                const profile = await StudentProfile.findOne({ userId: req.user._id });

                return res.json(profile || null);
        } catch (error) {
                console.error("Error fetching student profile", error);
                return res.status(500).json({ message: "Failed to fetch student profile" });
        }
});

const pickProfileFields = (body) => {
        const {
                college,
                major,
                level,
                currentSubjects,
                statusForPartners,
                statusForHelp,
                studyTimes,
        } = body;

        return {
                college,
                major,
                level,
                currentSubjects,
                statusForPartners,
                statusForHelp,
                studyTimes,
        };
};

const upsertProfile = async (req, res) => {
        try {
                if (req.user?.role !== "student") {
                        return res.status(403).json({ message: "Access denied - Students only" });
                }

                const payload = pickProfileFields(req.body);
                payload.userId = req.user._id;

                // TODO: validate subject ids and academic constraints once catalogs are finalized

                let profile = await StudentProfile.findOne({ userId: req.user._id });
                const isNew = !profile;

                if (profile) {
                        Object.assign(profile, payload);
                        await profile.save();
                } else {
                        profile = await StudentProfile.create(payload);
                }

                return res.status(isNew ? 201 : 200).json(profile);
        } catch (error) {
                console.error("Error saving student profile", error);
                return res.status(500).json({ message: "Failed to save student profile" });
        }
};

router.post("/profile", upsertProfile);
router.put("/profile", upsertProfile);

// Student ads routes
const allowedAdTypes = ["partner", "group", "tutor", "help"];

const buildAdPayload = (body = {}) => {
        const { adType, subjectId, subjectIds, description, partnershipMode, mode, period, joinExisting, needExplain, maxMembers } = body;

        const options = {};

        if (adType === "partner") {
                        const modes = Array.isArray(partnershipMode)
                                ? partnershipMode.filter(Boolean)
                                : partnershipMode
                                  ? [partnershipMode]
                                  : [];
                        if (modes.length) {
                                options.mode = modes;
                        }
        }

        if (adType === "group") {
                        if (Array.isArray(subjectIds)) {
                                options.subjectIds = subjectIds.slice(0, 4);
                        }
                        if (maxMembers) {
                                options.maxMembers = maxMembers;
                        }
                        if (mode) {
                                options.mode = mode;
                        }
                        if (joinExisting !== undefined) {
                                options.joinExisting = Boolean(joinExisting);
                        }
                        // TODO: connect to StudyGroup lifecycle when implemented
        }

        if (adType === "tutor") {
                        if (mode) {
                                options.mode = mode;
                        }
                        if (period) {
                                options.period = period;
                        }
        }

        if (adType === "help") {
                        options.needExplain = needExplain !== undefined ? Boolean(needExplain) : true;
        }

        return {
                adType,
                subject: subjectId,
                description,
                options,
        };
};

router.post("/ads", async (req, res) => {
        try {
                const { adType } = req.body;

                if (!allowedAdTypes.includes(adType)) {
                        return res.status(400).json({ message: "Invalid ad type" });
                }

                const adPayload = buildAdPayload(req.body);

                const ad = await Ad.create({
                        ...adPayload,
                        creator: req.user._id,
                        status: "active",
                });

                // TODO: matching logic and expiry rules

                return res.status(201).json(ad);
        } catch (error) {
                console.error("Error creating ad", error);
                return res.status(500).json({ message: "Failed to create ad" });
        }
});

router.get("/ads", async (req, res) => {
        try {
                        const ads = await Ad.find({ creator: req.user._id });
                        return res.json(ads);
        } catch (error) {
                        console.error("Error fetching ads", error);
                        return res.status(500).json({ message: "Failed to fetch ads" });
        }
});

router.get("/ads/:id", async (req, res) => {
        try {
                const ad = await Ad.findById(req.params.id);

                if (!ad || ad.creator?.toString() !== req.user._id.toString()) {
                        return res.status(404).json({ message: "Ad not found" });
                }

                return res.json(ad);
        } catch (error) {
                console.error("Error fetching ad", error);
                return res.status(500).json({ message: "Failed to fetch ad" });
        }
});

router.put("/ads/:id", async (req, res) => {
        try {
                const ad = await Ad.findById(req.params.id);

                if (!ad || ad.creator?.toString() !== req.user._id.toString()) {
                        return res.status(404).json({ message: "Ad not found" });
                }

                const { adType } = req.body;
                if (adType && adType !== ad.adType) {
                        return res.status(400).json({ message: "Ad type cannot be changed" });
                }

                const payload = buildAdPayload({ ...req.body, adType: ad.adType });
                ad.subject = payload.subject || ad.subject;
                ad.description = payload.description ?? ad.description;
                ad.options = { ...ad.options, ...payload.options };

                if (req.body.status) {
                        ad.status = req.body.status;
                }

                await ad.save();

                return res.json(ad);
        } catch (error) {
                console.error("Error updating ad", error);
                return res.status(500).json({ message: "Failed to update ad" });
        }
});

router.delete("/ads/:id", async (req, res) => {
        try {
                const ad = await Ad.findById(req.params.id);

                if (!ad || ad.creator?.toString() !== req.user._id.toString()) {
                        return res.status(404).json({ message: "Ad not found" });
                }

                await ad.deleteOne();

                return res.json({ message: "Ad deleted" });
        } catch (error) {
                console.error("Error deleting ad", error);
                return res.status(500).json({ message: "Failed to delete ad" });
        }
});

// TODO: matching
// TODO: payments
// TODO: receipts
// TODO: badges
// TODO: materials and subjects
// TODO: groups

router.get("/", (req, res) => {
        res.json({ status: "ok", user: req.user });
});

export default router;
