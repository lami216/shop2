import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { buildValidationError, isValidObjectId } from "../lib/validators.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import StudyGroup from "../models/StudyGroup.js";
import User from "../models/User.js";

const router = express.Router();

router.use(protect);

router.use((req, res, next) => {
        // Allow students and tutors to chat; admin can view when moderation tools are added.
        if (!["student", "tutor", "admin"].includes(req.user?.role)) {
                return res.status(403).json(buildValidationError("Access denied - messaging unavailable for this role"));
        }
        return next();
});

router.post("/private", async (req, res) => {
        try {
                const { userId } = req.body || {};

                if (!isValidObjectId(userId)) {
                        return res.status(400).json(buildValidationError("Valid target user is required"));
                }

                if (userId === req.user._id.toString()) {
                        return res.status(400).json({ message: "Cannot start a conversation with yourself" });
                }

                const targetUser = await User.findById(userId).select("_id role name isActive");

                if (!targetUser) {
                        return res.status(404).json({ message: "User not found" });
                }

                // TODO: enforce student-to-tutor messaging rules after payment confirmation and active lesson checks
                // TODO: prevent messaging blocked users and tie into reporting workflows

                let conversation = await Conversation.findPrivateBetween(req.user._id, targetUser._id);
                let wasCreated = false;

                if (!conversation) {
                        conversation = await Conversation.create({
                                type: "private",
                                participants: [req.user._id, targetUser._id],
                        });
                        wasCreated = true;
                }

                await conversation.populate("participants", "name role avatar");

                return res.status(wasCreated ? 201 : 200).json(conversation);
        } catch (error) {
                console.error("Error creating private conversation", error);
                return res.status(500).json({ message: "Failed to start conversation" });
        }
});

router.post("/group", async (req, res) => {
        try {
                const { groupId } = req.body || {};

                if (!isValidObjectId(groupId)) {
                        return res.status(400).json(buildValidationError("Valid group id is required"));
                }

                const group = await StudyGroup.findById(groupId).populate("members", "_id name role");

                if (!group) {
                        return res.status(404).json({ message: "Study group not found" });
                }

                const isMember = (group?.members || []).some(
                        (member) => member._id.toString() === req.user._id.toString()
                );

                if (!isMember) {
                        return res.status(403).json({ message: "You are not a member of this group" });
                }

                let conversation = await Conversation.findOne({ type: "group", groupId: group._id });
                let wasCreated = false;

                if (!conversation) {
                        conversation = await Conversation.create({
                                type: "group",
                                groupId: group._id,
                                participants: group.members.map((member) => member._id),
                        });
                        wasCreated = true;
                } else {
                        const alreadyInConversation = conversation.participants.some(
                                (participant) => participant.toString() === req.user._id.toString()
                        );

                        if (!alreadyInConversation) {
                                conversation.participants.push(req.user._id);
                                // TODO: sync all group members into conversation participants when membership changes
                                await conversation.save();
                        }
                }

                await conversation.populate("participants", "name role avatar");
                await conversation.populate("groupId", "groupName");

                return res.status(wasCreated ? 201 : 200).json(conversation);
        } catch (error) {
                console.error("Error attaching to group conversation", error);
                return res.status(500).json({ message: "Failed to attach to group chat" });
        }
});

router.get("/", async (req, res) => {
        try {
                const conversations = await Conversation.find({ participants: req.user._id })
                        .populate("participants", "name role avatar")
                        .populate("groupId", "groupName")
                        .sort({ updatedAt: -1 });

                const lastMessages = await Promise.all(
                        conversations.map((conversation) =>
                                Message.findOne({ conversationId: conversation._id })
                                        .sort({ createdAt: -1 })
                                        .select("content sender createdAt")
                                        .populate("sender", "name role avatar")
                                        .lean()
                        )
                );

                const response = conversations.map((conversation, index) => ({
                        _id: conversation._id,
                        type: conversation.type,
                        participants: conversation.participants,
                        group: conversation.groupId
                                ? { _id: conversation.groupId._id, groupName: conversation.groupId.groupName }
                                : null,
                        lastMessage: lastMessages[index] || null,
                        updatedAt: conversation.updatedAt,
                }));

                return res.json(response);
        } catch (error) {
                console.error("Error listing conversations", error);
                return res.status(500).json({ message: "Failed to fetch conversations" });
        }
});

router.get("/:id", async (req, res) => {
        try {
                if (!isValidObjectId(req.params.id)) {
                        return res.status(400).json(buildValidationError("Invalid conversation id"));
                }

                const conversation = await Conversation.findById(req.params.id)
                        .populate("participants", "name role avatar")
                        .populate("groupId", "groupName");

                if (!conversation) {
                        return res.status(404).json({ message: "Conversation not found" });
                }

                const isParticipant = conversation.participants.some(
                        (participant) => participant._id.toString() === req.user._id.toString()
                );

                if (!isParticipant) {
                        return res.status(403).json({ message: "Access denied" });
                }

                return res.json(conversation);
        } catch (error) {
                console.error("Error fetching conversation", error);
                return res.status(500).json({ message: "Failed to fetch conversation" });
        }
});

export default router;
