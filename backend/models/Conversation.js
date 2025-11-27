import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
        {
                participants: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "User",
                                required: true,
                        },
                ],
                type: {
                        type: String,
                        enum: ["private", "group"],
                        required: true,
                },
                groupId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "StudyGroup",
                },
        },
        {
                timestamps: true,
        }
);

conversationSchema.index(
        { type: 1, participants: 1 },
        {
                unique: true,
                partialFilterExpression: { type: "private" },
                // TODO: consider dedicated index for group conversations when message volume grows
        }
);

conversationSchema.pre("save", function (next) {
        if (this.type === "private" && Array.isArray(this.participants)) {
                this.participants = this.participants
                        .map((participantId) => participantId?.toString?.() || participantId)
                        .filter(Boolean)
                        .sort()
                        .map((participantId) => new mongoose.Types.ObjectId(participantId));
        }

        next();
});

conversationSchema.statics.findPrivateBetween = function (userA, userB) {
        const participantIds = [userA, userB]
                .map((participantId) => participantId?.toString?.() || participantId)
                .filter(Boolean)
                .sort();

        return this.findOne({
                type: "private",
                participants: { $all: participantIds },
                "participants.2": { $exists: false },
        });
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
