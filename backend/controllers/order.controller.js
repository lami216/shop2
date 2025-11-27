import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

const normalizeString = (value) => {
        if (value === undefined || value === null) {
                return "";
        }

        return value.toString().trim();
};

const normalizeIdString = (value) => (typeof value === "string" ? value.trim() : "");

const escapeRegex = (value) => {
        if (typeof value !== "string") {
                return "";
        }

        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildOrderFilters = ({ status, search }) => {
        const filters = {};

        const normalizedStatus = normalizeString(status);

        if (normalizedStatus && normalizedStatus !== "all") {
                filters.status = normalizedStatus;
        }

        const trimmedSearch = normalizeString(search);

        if (trimmedSearch) {
                const pattern = new RegExp(escapeRegex(trimmedSearch), "i");
                filters.$or = [
                        { "customer.name": pattern },
                        { "customer.phone": pattern },
                        { "customer.email": pattern },
                        { notes: pattern },
                ];
        }

        return filters;
};

export const getAdminOrders = async (req, res) => {
        try {
                const {
                        page = 1,
                        limit = 10,
                        status = "all",
                        search = "",
                        sortBy = "createdAt",
                        sortOrder = "desc",
                } = req.query;

                const numericPage = Math.max(parseInt(page, 10) || 1, 1);
                const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
                const skip = (numericPage - 1) * numericLimit;

                const filters = buildOrderFilters({ status, search });

                const sortableFields = new Set([
                        "createdAt",
                        "totalAmount",
                        "totalQuantity",
                        "status",
                ]);

                const normalizedSortBy = sortableFields.has(sortBy) ? sortBy : "createdAt";
                const normalizedSortOrder = sortOrder === "asc" ? 1 : -1;

                const [orders, total] = await Promise.all([
                        Order.find(filters)
                                .populate("user", "name email phone role")
                                .populate("products.product", "name price images")
                                .sort({ [normalizedSortBy]: normalizedSortOrder })
                                .skip(skip)
                                .limit(numericLimit),
                        Order.countDocuments(filters),
                ]);

                res.json({
                        data: orders,
                        pagination: {
                                page: numericPage,
                                limit: numericLimit,
                                total,
                                pages: Math.ceil(total / numericLimit) || 1,
                        },
                });
        } catch (error) {
                console.log("Error fetching admin orders", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateOrderStatus = async (req, res) => {
        try {
                const orderId = normalizeIdString(req.params?.id);
                const { status, paymentMethod } = req.body;

                const normalizedStatus = normalizeString(status);
                const normalizedPaymentMethod = normalizeString(paymentMethod);

                const allowedStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];
                const allowedPaymentMethods = ["whatsapp", "cash", "card", "bank_transfer"];

                if (normalizedStatus && !allowedStatuses.includes(normalizedStatus)) {
                        return res.status(400).json({ message: "حالة الطلب غير معتمدة" });
                }

                const order = orderId ? await Order.findById(orderId) : null;

                if (!order) {
                        return res.status(404).json({ message: "الطلب غير موجود" });
                }

                if (
                        order.status === "cancelled" &&
                        normalizedStatus &&
                        normalizedStatus !== "cancelled"
                ) {
                        return res.status(400).json({ message: "لا يمكن إعادة تفعيل طلب ملغي" });
                }

                if (normalizedStatus) {
                        order.status = normalizedStatus;
                        if (normalizedStatus === "cancelled") {
                                order.cancelledAt = new Date();
                        }
                }

                if (normalizedPaymentMethod) {
                        if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
                                return res.status(400).json({ message: "طريقة دفع غير صالحة" });
                        }

                        order.paymentMethod = normalizedPaymentMethod;
                }

                await order.save();

                res.json({ data: order });
        } catch (error) {
                console.log("Error updating order status", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const cancelOrder = async (req, res) => {
        try {
                const orderId = normalizeIdString(req.params?.id);
                const { reason } = req.body;

                const order = orderId ? await Order.findById(orderId) : null;

                if (!order) {
                        return res.status(404).json({ message: "الطلب غير موجود" });
                }

                if (order.status === "cancelled") {
                        return res.status(400).json({ message: "تم إلغاء الطلب بالفعل" });
                }

                const normalizedReason = normalizeString(reason);

                order.status = "cancelled";
                order.cancellationReason = normalizedReason || undefined;
                order.cancelledAt = new Date();

                await order.save();

                res.json({ data: order });
        } catch (error) {
                console.log("Error cancelling order", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const incrementCouponUsage = async (couponCode) => {
        if (!couponCode) return;

        try {
                const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
                if (!coupon) return;

                coupon.usageCount += 1;
                if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
                        coupon.isActive = false;
                }
                await coupon.save();
        } catch (error) {
                console.log("Failed to increment coupon usage", error.message);
        }
};
