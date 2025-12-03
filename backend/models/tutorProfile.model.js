import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema(
        {
                user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                        unique: true,
                },
                bio: {
                        type: String,
                },
                subjects: {
                        type: [mongoose.Schema.Types.ObjectId],
                        ref: "Subject",
                        default: [],
                },
                experienceYears: {
                        type: Number,
                        default: 0,
                },
                hourlyRate: {
                        type: Number,
                },
                isVerified: {
                        type: Boolean,
                        default: false,
                },
        },
        { timestamps: true }
);

const TutorProfile = mongoose.model("TutorProfile", tutorProfileSchema);

export default TutorProfile;
