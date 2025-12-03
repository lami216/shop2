import mongoose from "mongoose";

const majorSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                },
                college: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "College",
                        required: true,
                },
                code: {
                        type: String,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

const Major = mongoose.model("Major", majorSchema);

export default Major;
