import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { cancelOrder, getAdminOrders, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.use(protectRoute, adminRoute);

router.get("/", getAdminOrders);
router.patch("/:id", updateOrderStatus);
router.post("/:id/cancel", cancelOrder);

export default router;
