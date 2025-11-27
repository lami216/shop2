import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { buildValidationError, isNonEmptyString, isValidObjectId } from "../lib/validators.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
        try {
                const { conversationId, content, meta } = req.body || {};

                if (!isValidObjectId(conversationId) || !isNonEmptyString(content)) {
                        return res
                                .status(400)
                                .json(buildValidationError("Conversation and non-empty content are required"));
                }

                const conversation = await Conversation.findById(conversationId);

                if (!conversation) {
                        return res.status(404).json({ message: "Conversation not found" });
                }

                const isParticipant = conversation.participants.some(
                        (participant) => participant.toString() === req.user._id.toString()
                );

                // TODO: allow admin or safety reviewers to bypass participant check when escalation is needed
                // TODO: block messaging for muted/blocked users once reporting tools are in place

                if (!isParticipant) {
                        return res.status(403).json({ message: "Access denied" });
                }

                const message = await Message.create({
                        conversationId,
                        sender: req.user._id,
                        content,
                        meta: meta || {},
                });

                conversation.updatedAt = message.createdAt;
                await conversation.save();

                // TODO: connect to WebSocket gateway for live delivery

                return res.status(201).json(message);
        } catch (error) {
                console.error("Error sending message", error);
                return res.status(500).json({ message: "Failed to send message" });
        }
});

router.get("/:conversationId", async (req, res) => {
        try {
                const { conversationId } = req.params;
                if (!isValidObjectId(conversationId)) {
                        return res.status(400).json(buildValidationError("Invalid conversation id"));
                }
                const conversation = await Conversation.findById(conversationId);

                if (!conversation) {
                        return res.status(404).json({ message: "Conversation not found" });
                }

                const isParticipant = conversation.participants.some(
                        (participant) => participant.toString() === req.user._id.toString()
                );

                if (!isParticipant) {
                        return res.status(403).json({ message: "Access denied" });
                }

                const messages = await Message.find({ conversationId })
                        .sort({ createdAt: 1 })
                        .populate("sender", "name role avatar")
                        .lean();

                // TODO: add pagination and date cursors when threads grow

                return res.json(messages);
        } catch (error) {
                console.error("Error fetching messages", error);
                return res.status(500).json({ message: "Failed to fetch messages" });
        }
});

export default router;
