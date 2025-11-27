import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
        {
                conversationId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Conversation",
                        required: true,
                },
                sender: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
                content: {
                        type: String,
                        required: true,
                        trim: true,
                },
                meta: {
                        type: Object,
                        default: {},
                        // TODO: attach file metadata, reactions, and future delivery receipts
                },
        },
        {
                timestamps: true,
        }
);

// TODO: add indexes for conversationId and createdAt once message volume scales
// TODO: track unread status per participant and moderation flags

const Message = mongoose.model("Message", messageSchema);

export default Message;
