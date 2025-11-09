import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

const buildOrderFilters = ({ status, search }) => {
        const filters = {};

        if (status && status !== "all") {
                filters.status = status;
        }

        if (search) {
                const pattern = new RegExp(search.trim(), "i");
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
                                .populate("user", "name email phoneNumber role")
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
                const { id } = req.params;
                const { status, paymentMethod } = req.body;

                const allowedStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];

                if (status && !allowedStatuses.includes(status)) {
                        return res.status(400).json({ message: "حالة الطلب غير معتمدة" });
                }

                const order = await Order.findById(id);

                if (!order) {
                        return res.status(404).json({ message: "الطلب غير موجود" });
                }

                if (order.status === "cancelled" && status && status !== "cancelled") {
                        return res.status(400).json({ message: "لا يمكن إعادة تفعيل طلب ملغي" });
                }

                if (status) {
                        order.status = status;
                        if (status === "cancelled") {
                                order.cancelledAt = new Date();
                        }
                }

                if (paymentMethod) {
                        order.paymentMethod = paymentMethod;
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
                const { id } = req.params;
                const { reason } = req.body;

                const order = await Order.findById(id);

                if (!order) {
                        return res.status(404).json({ message: "الطلب غير موجود" });
                }

                if (order.status === "cancelled") {
                        return res.status(400).json({ message: "تم إلغاء الطلب بالفعل" });
                }

                order.status = "cancelled";
                order.cancellationReason = reason?.trim();
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
