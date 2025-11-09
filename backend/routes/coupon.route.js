import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
        createCoupons,
        deleteCoupon,
        getCoupon,
        listCoupons,
        toggleCoupon,
        updateCoupon,
        validateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);

router.get("/admin", protectRoute, adminRoute, listCoupons);
router.post("/admin", protectRoute, adminRoute, createCoupons);
router.put("/admin/:id", protectRoute, adminRoute, updateCoupon);
router.patch("/admin/:id/toggle", protectRoute, adminRoute, toggleCoupon);
router.delete("/admin/:id", protectRoute, adminRoute, deleteCoupon);

export default router;
