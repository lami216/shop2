import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        trim: true,
                },
                phone: {
                        type: String,
                        trim: true,
                },
                email: {
                        type: String,
                        trim: true,
                },
                address: {
                        type: String,
                        trim: true,
                },
        },
        { _id: false }
);

const orderProductSchema = new mongoose.Schema(
        {
                product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
                },
                quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                },
                price: {
                        type: Number,
                        required: true,
                        min: 0,
                },
        },
        { _id: false }
);

const orderSchema = new mongoose.Schema(
        {
                user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
                products: [orderProductSchema],
                totalAmount: {
                        type: Number,
                        required: true,
                        min: 0,
                },
                totalQuantity: {
                        type: Number,
                        default: 0,
                        min: 0,
                },
                status: {
                        type: String,
                        enum: ["pending", "processing", "shipped", "completed", "cancelled"],
                        default: "pending",
                        index: true,
                },
                paymentMethod: {
                        type: String,
                        enum: ["whatsapp", "cash", "card", "bank_transfer"],
                        default: "whatsapp",
                },
                customer: customerSchema,
                notes: {
                        type: String,
                        trim: true,
                },
                cancellationReason: {
                        type: String,
                        trim: true,
                },
                cancelledAt: {
                        type: Date,
                },
                stripeSessionId: {
                        type: String,
                        unique: true,
                        sparse: true,
                },
        },
        { timestamps: true }
);

orderSchema.pre("save", function preSave(next) {
        if (Array.isArray(this.products)) {
                this.totalQuantity = this.products.reduce(
                        (total, item) => total + Number(item.quantity || 0),
                        0
                );
        }
        next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
