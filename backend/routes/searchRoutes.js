import express from "express";

// TODO: matching
// TODO: payments
// TODO: receipts
// TODO: ads
// TODO: badges
// TODO: materials and subjects
// TODO: groups

const router = express.Router();

router.get("/", (req, res) => {
        res.send("OK");
});

export default router;
