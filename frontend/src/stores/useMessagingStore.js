import { create } from "zustand";
import apiClient from "../lib/apiClient";
import { socket } from "../lib/socket";
import { useUserStore } from "./useUserStore";

let typingTimeout;

export const useMessagingStore = create((set, get) => {
        const initialUser = useUserStore.getState().user;

        if (initialUser?._id) {
                socket.emit("identify", initialUser._id);
        }

        useUserStore.subscribe(
                (state) => state.user,
                (user) => {
                        if (user?._id) {
                                socket.emit("identify", user._id);
                        }
                }
        );

        socket.on("newMessage", (msg) => {
                const conversationId = String(msg.conversation?._id || msg.conversation);
                const userId = useUserStore.getState().user?._id;
                const existingMessage = get().messages.some((m) => m._id === msg._id);

                if (existingMessage) return;

                set((state) => {
                        const isActive = state.activeConversation === conversationId;
                        const updatedMessages = isActive ? [...state.messages, msg] : state.messages;

                        const conversations = state.conversations.some((c) => c._id === conversationId)
                                ? state.conversations.map((conversation) => {
                                          if (conversation._id !== conversationId) return conversation;

                                          const unreadCounts = { ...(conversation.unreadCounts || {}) };

                                          if (userId) {
                                                  unreadCounts[userId] = isActive
                                                          ? 0
                                                          : (unreadCounts[userId] || 0) + 1;
                                          }

                                          return {
                                                  ...conversation,
                                                  lastMessage: msg,
                                                  unreadCounts,
                                          };
                                  })
                                : state.conversations;

                        return {
                                messages: updatedMessages,
                                conversations,
                        };
                });
        });

        socket.on("typing", ({ fromUserId }) => {
                const currentUserId = useUserStore.getState().user?._id;
                if (currentUserId && String(fromUserId) === String(currentUserId)) return;

                clearTimeout(typingTimeout);
                set({ typingUserId: fromUserId });

                typingTimeout = setTimeout(() => {
                        set({ typingUserId: null });
                }, 2000);
        });

        socket.on("messagesSeen", ({ userId }) => {
                set((state) => ({
                        lastSeenBy: userId,
                        conversations: state.conversations.map((conversation) => {
                                if (conversation._id !== state.activeConversation) return conversation;

                                return {
                                        ...conversation,
                                        unreadCounts: { ...(conversation.unreadCounts || {}), [userId]: 0 },
                                };
                        }),
                }));
        });

        return {
                conversations: [],
                messages: [],
                loading: false,
                activeConversation: null,
                typingUserId: null,
                lastSeenBy: null,

                fetchConversations: async () => {
                        set({ loading: true });
                        try {
                                const data = await apiClient.get("/api/moltaqa/messages/list");
                                set({ conversations: data || [], loading: false });
                                return data;
                        } catch (error) {
                                console.error("Failed to fetch conversations", error);
                                set({ loading: false });
                                return [];
                        }
                },

                startConversation: async (partnerId) => {
                        set({ loading: true });
                        try {
                                const conversation = await apiClient.post("/api/moltaqa/messages/start", { partnerId });

                                set((state) => ({
                                        loading: false,
                                        activeConversation: conversation?._id || state.activeConversation,
                                        conversations: state.conversations.some((c) => c._id === conversation?._id)
                                                ? state.conversations
                                                : [conversation, ...state.conversations],
                                }));

                                return conversation;
                        } catch (error) {
                                console.error("Failed to start conversation", error);
                                set({ loading: false });
                                throw error;
                        }
                },

                sendMessage: async (conversationId, text) => {
                        set({ loading: true });
                        try {
                                const user = useUserStore.getState().user;
                                const message = await apiClient.post("/api/moltaqa/messages/send", { conversationId, text });

                                set((state) => ({
                                        loading: false,
                                        messages:
                                                state.activeConversation === conversationId
                                                        ? [...state.messages, message]
                                                        : state.messages,
                                        conversations: state.conversations.map((conversation) => {
                                                if (conversation._id !== conversationId) return conversation;

                                                return { ...conversation, lastMessage: message };
                                        }),
                                }));

                                if (user?._id) {
                                        socket.emit("sendMessage", {
                                                conversationId,
                                                senderId: user._id,
                                                text,
                                        });
                                }

                                return message;
                        } catch (error) {
                                console.error("Failed to send message", error);
                                set({ loading: false });
                                throw error;
                        }
                },

                fetchMessages: async (conversationId) => {
                        set({ loading: true, activeConversation: conversationId });
                        socket.emit("joinConversation", conversationId);
                        try {
                                const data = await apiClient.get(`/api/moltaqa/messages/${conversationId}`);
                                const userId = useUserStore.getState().user?._id;

                                set((state) => ({
                                        messages: data || [],
                                        activeConversation: conversationId,
                                        loading: false,
                                        conversations: userId
                                                ? state.conversations.map((conversation) => {
                                                          if (conversation._id !== conversationId) return conversation;

                                                          return {
                                                                  ...conversation,
                                                                  unreadCounts: {
                                                                          ...(conversation.unreadCounts || {}),
                                                                          [userId]: 0,
                                                                  },
                                                          };
                                                  })
                                                : state.conversations,
                                }));
                                return data;
                        } catch (error) {
                                console.error("Failed to fetch messages", error);
                                set({ loading: false });
                                return [];
                        }
                },
        };
});

export default useMessagingStore;
