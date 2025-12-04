import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";

export const useStudentProfileStore = create((set, get) => ({
        profile: null,
        loading: false,
        matches: [],
        matchLoading: false,

        fetchMyProfile: async () => {
                set({ loading: true });
                try {
                        const data = await apiClient.get("/api/moltaqa/student/me");
                        set({ profile: data, loading: false });
                        return data;
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || "تعذر تحميل ملفك الدراسي");
                }
        },

        saveProfile: async (data) => {
                set({ loading: true });
                try {
                        await apiClient.post("/api/moltaqa/student/me", data);
                        await get().fetchMyProfile();
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || "تعذر حفظ الملف الدراسي");
                        throw error;
                }
        },

        searchMatches: async (filters) => {
                set({ matchLoading: true });
                try {
                        const data = await apiClient.post("/api/moltaqa/search", filters);
                        set({ matches: data?.matches || [], matchLoading: false });
                        return data;
                } catch (error) {
                        set({ matchLoading: false });
                        toast.error(error.response?.data?.message || "تعذر تحميل نتائج المطابقة");
                }
        },
}));
