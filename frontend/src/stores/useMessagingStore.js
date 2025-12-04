import { create } from "zustand";
import apiClient from "../lib/apiClient";

export const useMessagingStore = create((set, get) => ({
        conversations: [],
        messages: [],
        loading: false,
        activeConversation: null,

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
                        const message = await apiClient.post("/api/moltaqa/messages/send", { conversationId, text });
                        set((state) => ({
                                loading: false,
                                messages:
                                        state.activeConversation === conversationId
                                                ? [...state.messages, message]
                                                : state.messages,
                        }));
                        return message;
                } catch (error) {
                        console.error("Failed to send message", error);
                        set({ loading: false });
                        throw error;
                }
        },

        fetchMessages: async (conversationId) => {
                set({ loading: true, activeConversation: conversationId });
                try {
                        const data = await apiClient.get(`/api/moltaqa/messages/${conversationId}`);
                        set({ messages: data || [], activeConversation: conversationId, loading: false });
                        return data;
                } catch (error) {
                        console.error("Failed to fetch messages", error);
                        set({ loading: false });
                        return [];
                }
        },
}));

export default useMessagingStore;
