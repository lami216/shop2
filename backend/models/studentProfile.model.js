import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
        {
                user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                        unique: true,
                },
                college: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "College",
                },
                major: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Major",
                },
                level: {
                        type: Number,
                },
                subjects: {
                        type: [mongoose.Schema.Types.ObjectId],
                        ref: "Subject",
                        default: [],
                },
                bio: {
                        type: String,
                },
                studyModes: {
                        type: [String],
                        default: [],
                },
                availability: {
                        type: String,
                },
                isVisible: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
