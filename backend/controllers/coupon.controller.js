import Coupon from "../models/coupon.model.js";

const normalizeString = (value) => {
        if (value === undefined || value === null) {
                return "";
        }

        return value.toString().trim();
};

const normalizeUpperString = (value) => normalizeString(value).toUpperCase();

const normalizeNumber = (value, defaultValue = 0) => {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : defaultValue;
};

const escapeRegex = (value) => {
        if (typeof value !== "string") {
                return "";
        }

        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildCouponQuery = (req) => {
        const now = new Date();
        return {
                isActive: true,
                $and: [
                        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
                        { $or: [{ expirationDate: { $exists: false } }, { expirationDate: { $gte: now } }] },
                ],
                $or: [
                        { assignedUser: null },
                        { assignedUser: req.user._id },
                ],
        };
};

export const getCoupon = async (req, res) => {
        try {
                const coupon = await Coupon.findOne(buildCouponQuery(req)).sort({ createdAt: -1 });
                res.json(coupon || null);
        } catch (error) {
                console.log("Error in getCoupon controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const validateCoupon = async (req, res) => {
        try {
                const code = normalizeUpperString(req.body?.code);

                if (!code) {
                        return res.status(400).json({ message: "رمز القسيمة غير صالح" });
                }

                const coupon = await Coupon.findOne({ code });

                if (!coupon) {
                        return res.status(404).json({ message: "القسيمة غير موجودة" });
                }

                const now = new Date();

                if (!coupon.isActive) {
                        return res.status(400).json({ message: "القسيمة غير مفعلة" });
                }

                if (coupon.startDate && coupon.startDate > now) {
                        return res.status(400).json({ message: "القسيمة غير متاحة بعد" });
                }

                if (coupon.expirationDate && coupon.expirationDate < now) {
                        coupon.isActive = false;
                        await coupon.save();
                        return res.status(404).json({ message: "انتهت صلاحية القسيمة" });
                }

                if (coupon.assignedUser && coupon.assignedUser.toString() !== req.user._id.toString()) {
                        return res.status(403).json({ message: "هذه القسيمة مخصصة لحساب آخر" });
                }

                if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
                        coupon.isActive = false;
                        await coupon.save();
                        return res.status(400).json({ message: "تم استخدام هذه القسيمة بالكامل" });
                }

                res.json({
                        code: coupon.code,
                        discountPercentage: coupon.discountPercentage,
                        minOrderValue: coupon.minOrderValue,
                        message: "Coupon is valid",
                });
        } catch (error) {
                console.log("Error in validateCoupon controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const listCoupons = async (req, res) => {
        try {
                const {
                        page = 1,
                        limit = 10,
                        search = "",
                        status,
                        sortBy = "createdAt",
                        sortOrder = "desc",
                } = req.query;

                const numericPage = Math.max(parseInt(page, 10) || 1, 1);
                const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
                const skip = (numericPage - 1) * numericLimit;

                const query = {};
                if (status === "active") query.isActive = true;
                if (status === "inactive") query.isActive = false;

                const trimmedSearch = typeof search === "string" ? search.trim() : "";

                if (trimmedSearch) {
                        const pattern = new RegExp(escapeRegex(trimmedSearch), "i");
                        query.$or = [
                                { code: pattern },
                                { label: pattern },
                                { description: pattern },
                                { batchId: pattern },
                        ];
                }

                const sortFields = new Set(["createdAt", "code", "discountPercentage", "expirationDate", "usageCount"]);
                const normalizedSortBy = sortFields.has(sortBy) ? sortBy : "createdAt";
                const normalizedSortOrder = sortOrder === "asc" ? 1 : -1;

                const [coupons, total] = await Promise.all([
                        Coupon.find(query)
                                .sort({ [normalizedSortBy]: normalizedSortOrder })
                                .skip(skip)
                                .limit(numericLimit),
                        Coupon.countDocuments(query),
                ]);

                res.json({
                        data: coupons,
                        pagination: {
                                page: numericPage,
                                limit: numericLimit,
                                total,
                                pages: Math.ceil(total / numericLimit) || 1,
                        },
                });
        } catch (error) {
                console.log("Error listing coupons", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

const generateCode = ({ prefix = "KING", length = 6 }) => {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const generated = Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
        return `${prefix}${generated}`.toUpperCase();
};

const normalizeCouponPayload = (payload = {}) => {
        const normalized = {
                code: normalizeUpperString(payload.code),
                label: normalizeString(payload.label),
                description: normalizeString(payload.description),
                discountPercentage: normalizeNumber(payload.discountPercentage),
                minOrderValue: normalizeNumber(payload.minOrderValue),
                startDate: payload.startDate ? new Date(payload.startDate) : undefined,
                expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : undefined,
                usageLimit: normalizeNumber(payload.usageLimit),
                assignedUser: payload.assignedUser || null,
                batchId: normalizeString(payload.batchId),
        };

        if (Number.isNaN(normalized.discountPercentage) || normalized.discountPercentage <= 0) {
                throw new Error("discountPercentage must be a positive number");
        }

        if (normalized.discountPercentage > 100) {
                throw new Error("discountPercentage must be less than or equal to 100");
        }

        if (normalized.startDate && Number.isNaN(normalized.startDate.getTime())) {
                throw new Error("Invalid startDate value");
        }

        if (normalized.expirationDate && Number.isNaN(normalized.expirationDate.getTime())) {
                throw new Error("Invalid expirationDate value");
        }

        return normalized;
};

export const createCoupons = async (req, res) => {
        try {
                const { mode = "single", quantity = 1, prefix, length, ...payload } = req.body || {};
                const normalizedPrefix = normalizeUpperString(prefix);
                const createdBy = req.user?._id;

                if (mode === "bulk") {
                        const numericQuantity = Math.min(Math.max(parseInt(quantity, 10) || 0, 1), 200);
                        const generatedCodes = new Set();
                        const couponsToCreate = [];

                        while (generatedCodes.size < numericQuantity) {
                                const code = generateCode({
                                        prefix: normalizedPrefix || undefined,
                                        length: Number(length) || 6,
                                });
                                if (generatedCodes.has(code)) continue;

                                const exists = await Coupon.exists({ code });
                                if (exists) continue;

                                generatedCodes.add(code);
                                const normalized = normalizeCouponPayload({ ...payload, code });
                                couponsToCreate.push({
                                        ...normalized,
                                        createdBy,
                                        batchId: normalized.batchId || normalizedPrefix || prefix,
                                });
                        }

                        const documents = await Coupon.insertMany(couponsToCreate);
                        return res.status(201).json({ data: documents });
                }

                const normalizedPayload = normalizeCouponPayload(payload);

                if (!normalizedPayload.code) {
                        return res.status(400).json({ message: "يجب تحديد رمز القسيمة" });
                }

                const existing = await Coupon.findOne({ code: normalizedPayload.code });
                if (existing) {
                        return res.status(409).json({ message: "رمز القسيمة مستخدم بالفعل" });
                }

                const coupon = await Coupon.create({ ...normalizedPayload, createdBy });
                return res.status(201).json({ data: coupon });
        } catch (error) {
                console.log("Error creating coupon", error.message);
                if (error.message?.includes("discountPercentage")) {
                        return res.status(400).json({ message: "قيمة الخصم غير صحيحة" });
                }

                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateCoupon = async (req, res) => {
        try {
                const { id } = req.params;
                const normalizedPayload = normalizeCouponPayload(req.body || {});

                if (!normalizedPayload.code) {
                        return res.status(400).json({ message: "يجب تحديد رمز القسيمة" });
                }

                const conflicting = await Coupon.findOne({
                        _id: { $ne: id },
                        code: normalizedPayload.code,
                });

                if (conflicting) {
                        return res.status(409).json({ message: "رمز القسيمة مستخدم بالفعل" });
                }

                const coupon = await Coupon.findByIdAndUpdate(
                        id,
                        { ...normalizedPayload },
                        { new: true }
                );

                if (!coupon) {
                        return res.status(404).json({ message: "القسيمة غير موجودة" });
                }

                res.json({ data: coupon });
        } catch (error) {
                console.log("Error updating coupon", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const toggleCoupon = async (req, res) => {
        try {
                const { id } = req.params;
                const coupon = await Coupon.findById(id);

                if (!coupon) {
                        return res.status(404).json({ message: "القسيمة غير موجودة" });
                }

                coupon.isActive = !coupon.isActive;
                await coupon.save();

                res.json({ data: coupon });
        } catch (error) {
                console.log("Error toggling coupon", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteCoupon = async (req, res) => {
        try {
                const { id } = req.params;
                const deleted = await Coupon.findByIdAndDelete(id);

                if (!deleted) {
                        return res.status(404).json({ message: "القسيمة غير موجودة" });
                }

                res.json({ message: "تم حذف القسيمة" });
        } catch (error) {
                console.log("Error deleting coupon", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};
