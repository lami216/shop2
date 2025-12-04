import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const onlineUsers = new Map(); // userId → socketId

export default function messagingSocket(io) {
        io.on("connection", (socket) => {
                console.log("Socket connected:", socket.id);

                // When the client identifies as a user
                socket.on("identify", (userId) => {
                        onlineUsers.set(userId, socket.id);
                });

                // typing indicator
                socket.on("typing", ({ conversationId, fromUserId }) => {
                        socket.to(conversationId).emit("typing", { fromUserId });
                });

                // join room for conversation
                socket.on("joinConversation", (conversationId) => {
                        socket.join(conversationId);
                });

                // sending new real-time message
                socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
                        const message = await Message.create({
                                conversation: conversationId,
                                sender: senderId,
                                text,
                                seenBy: [senderId],
                        });

                        // update last message + unread counts
                        const conv = await Conversation.findById(conversationId);
                        conv.lastMessage = message._id;

                        conv.participants.forEach((p) => {
                                if (String(p) !== String(senderId)) {
                                        const prev = conv.unreadCounts.get(String(p)) || 0;
                                        conv.unreadCounts.set(String(p), prev + 1);
                                }
                        });

                        await conv.save();

                        const populatedMessage = await Message.findById(message._id)
                                .populate("sender", "name email")
                                .lean();

                        // emit to all users in this conversation
                        io.to(conversationId).emit("newMessage", populatedMessage);
                });

                // mark messages as seen
                socket.on("seenConversation", async ({ conversationId, userId }) => {
                        const conv = await Conversation.findById(conversationId);
                        if (!conv) return;

                        conv.unreadCounts.set(userId, 0);
                        await conv.save();

                        socket.to(conversationId).emit("messagesSeen", { userId });
                });

                socket.on("disconnect", () => {
                        for (const [userId, sId] of onlineUsers.entries()) {
                                if (sId === socket.id) {
                                        onlineUsers.delete(userId);
                                        break;
                                }
                        }
                });
        });
}
