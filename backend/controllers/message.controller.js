import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createOrGetConversation = async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ message: "partnerId is required" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, partnerId] },
    }).populate({ path: "participants", select: "name email" });

    if (existing) {
      return res.json(existing);
    }

    const conversation = await Conversation.create({
      participants: [req.user._id, partnerId],
      unreadCounts: {
        [String(req.user._id)]: 0,
        [String(partnerId)]: 0,
      },
    });

    const populated = await conversation.populate({
      path: "participants",
      select: "name email",
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createOrGetConversation", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ message: "conversationId and text are required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: "Not authorized for this conversation" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      seenBy: [req.user._id],
    });

    conversation.lastMessage = message._id;

    conversation.participants.forEach((participantId) => {
      const key = String(participantId);
      if (key === String(req.user._id)) return;

      const currentCount = conversation.unreadCounts.get?.(key) ?? conversation.unreadCounts[key] ?? 0;

      if (typeof conversation.unreadCounts.set === "function") {
        conversation.unreadCounts.set(key, (currentCount || 0) + 1);
      } else {
        conversation.unreadCounts[key] = (currentCount || 0) + 1;
      }
    });

    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in sendMessage", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate({ path: "participants", select: "name email" })
      .populate({
        path: "lastMessage",
        select: "text sender",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error in getMyConversations", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: "Not authorized for this conversation" });
    }

    await Message.updateMany(
      { conversation: conversationId, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    if (typeof conversation.unreadCounts.set === "function") {
      conversation.unreadCounts.set(String(req.user._id), 0);
    } else {
      conversation.unreadCounts[String(req.user._id)] = 0;
    }

    await conversation.save();

    res.json(messages);
  } catch (error) {
    console.error("Error in getMessages", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
