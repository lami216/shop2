import { create } from "zustand";
import apiClient from "../lib/apiClient";

export const usePublicProfileStore = create((set) => ({
        profile: null,
        loading: false,
        error: null,

        fetchPublicProfile: async (userId) => {
                set({ loading: true, error: null, profile: null });
                try {
                        const data = await apiClient.get(`/api/moltaqa/student/${userId}`);
                        set({ profile: data?.profile || null, loading: false });
                        return data?.profile || null;
                } catch (error) {
                        const message = error.response?.data?.message || "تعذر تحميل الملف";
                        set({ error: message, loading: false, profile: null });
                        return null;
                }
        },
}));
