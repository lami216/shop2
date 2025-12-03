import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                },
                shortName: {
                        type: String,
                },
                country: {
                        type: String,
                },
                city: {
                        type: String,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

const College = mongoose.model("College", collegeSchema);

export default College;
