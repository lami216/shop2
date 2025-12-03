import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                },
                code: {
                        type: String,
                },
                major: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Major",
                        required: true,
                },
                level: {
                        type: Number,
                },
                semester: {
                        type: String,
                },
                tags: {
                        type: [String],
                        default: [],
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
