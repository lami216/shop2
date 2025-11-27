import { apiClient } from "../lib/apiClient";

export const fetchConversations = () => apiClient.get("/conversations");

export const fetchConversationById = (conversationId) =>
        apiClient.get(`/conversations/${conversationId}`);

export const startPrivateConversation = (userId) =>
        apiClient.post("/conversations/private", { userId });

export const joinGroupConversation = (groupId) =>
        apiClient.post("/conversations/group", { groupId });

export const fetchMessages = (conversationId) => apiClient.get(`/messages/${conversationId}`);

export const sendMessage = (payload) => apiClient.post("/messages", payload);

// TODO: add pagination params and inbox filters when messaging matures
