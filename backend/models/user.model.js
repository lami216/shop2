import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: [true, "Name is required"],
                        trim: true,
                },
                email: {
                        type: String,
                        required: [true, "Email is required"],
                        unique: true,
                        lowercase: true,
                        trim: true,
                },
                password: {
                        type: String,
                        required: [true, "Password is required"],
                        minlength: [6, "Password must be at least 6 characters long"],
                },
                phone: {
                        type: String,
                        trim: true,
                },
                gender: {
                        type: String,
                        trim: true,
                },
                role: {
                        type: String,
                        enum: ["student", "tutor", "admin", "customer"],
                        default: "student",
                },
                language: {
                        type: String,
                        enum: ["ar", "fr", "en"],
                        default: "ar",
                },
                avatar: {
                        type: String,
                        trim: true,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
                studentProfile: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "StudentProfile",
                },
                tutorProfile: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "TutorProfile",
                },
                cartItems: [
                        {
                                quantity: {
                                        type: Number,
                                        default: 1,
                                },
                                product: {
                                        type: mongoose.Schema.Types.ObjectId,
                                        ref: "Product",
                                },
                        },
                ],
        },
        {
                timestamps: true,
        }
);

userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return next();

        try {
                        // TODO: enforce stronger password policies per role
                const salt = await bcrypt.genSalt(10);
                this.password = await bcrypt.hash(this.password, salt);
                next();
        } catch (error) {
                next(error);
        }
});

userSchema.methods.comparePassword = async function (password) {
        return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
