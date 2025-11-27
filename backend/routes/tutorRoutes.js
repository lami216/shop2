import express from "express";

import { protect, requireTutor } from "../middleware/auth.middleware.js";

// TODO: matching
// TODO: payments
// TODO: receipts
// TODO: ads
// TODO: badges
// TODO: materials and subjects
// TODO: groups

const router = express.Router();

router.use(protect, requireTutor);

router.get("/", (req, res) => {
        res.json({ status: "ok", user: req.user });
});

export default router;
