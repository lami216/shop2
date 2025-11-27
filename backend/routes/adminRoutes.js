import express from "express";

import { protect, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllBadges } from "../services/badgeService.js";

// TODO: matching
// TODO: payments
// TODO: receipts
// TODO: ads
// TODO: badges
// TODO: materials and subjects
// TODO: groups

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/", (req, res) => {
        res.json({ status: "ok", user: req.user });
});

router.get("/badges", async (req, res) => {
        try {
                const badges = await getAllBadges();
                return res.json(badges);
        } catch (error) {
                // TODO: replace with shared error handler once admin module expands
                console.error("Failed to fetch badges", error?.message || error);
                return res.status(500).json({ message: "Could not fetch badges" });
        }
});

export default router;
