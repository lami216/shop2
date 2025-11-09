import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
        {
                code: {
                        type: String,
                        required: true,
                        unique: true,
                        uppercase: true,
                        trim: true,
                },
                label: {
                        type: String,
                        trim: true,
                },
                description: {
                        type: String,
                        trim: true,
                },
                discountPercentage: {
                        type: Number,
                        required: true,
                        min: 1,
                        max: 100,
                },
                minOrderValue: {
                        type: Number,
                        min: 0,
                        default: 0,
                },
                startDate: {
                        type: Date,
                },
                expirationDate: {
                        type: Date,
                },
                usageLimit: {
                        type: Number,
                        min: 0,
                        default: 0,
                },
                usageCount: {
                        type: Number,
                        min: 0,
                        default: 0,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                        index: true,
                },
                assignedUser: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                        index: true,
                },
                batchId: {
                        type: String,
                        trim: true,
                        index: true,
                },
                createdBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                },
        },
        {
                timestamps: true,
        }
);

couponSchema.virtual("isExpired").get(function virtualIsExpired() {
        if (!this.expirationDate) return false;
        return this.expirationDate < new Date();
});

couponSchema.virtual("isScheduled").get(function virtualIsScheduled() {
        if (!this.startDate) return false;
        const now = new Date();
        return this.startDate > now;
});

couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
