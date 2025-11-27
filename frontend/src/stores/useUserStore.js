import { create } from "zustand";
import { toast } from "react-hot-toast";
import { registerAuthHandlers } from "../lib/apiClient";
import { translate } from "../lib/locale";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService";

export const useUserStore = create((set) => ({
        user: null,
        loading: false,
        checkingAuth: true,

        signup: async (payload) => {
                set({ loading: true });

                try {
                        const data = await registerUser(payload);
                        set({ user: data, loading: false });
                        toast.success(translate("common.messages.registerSuccess") || "Registered");
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.genericError"));
                }
        },
        login: async (payload) => {
                set({ loading: true });

                try {
                        const data = await loginUser(payload);
                        set({ user: data, loading: false });
                } catch (error) {
                        set({ loading: false });
                        toast.error(error.response?.data?.message || translate("toast.genericError"));
                }
        },

        logout: async () => {
                try {
                        await logoutUser();
                        set({ user: null });
                } catch (error) {
                        toast.error(error.response?.data?.message || translate("toast.logoutError"));
                }
        },

        checkAuth: async () => {
                set({ checkingAuth: true });
                try {
                        const data = await getCurrentUser();
                        set({ user: data, checkingAuth: false });
                } catch (error) {
                        console.log(error.message);
                        set({ checkingAuth: false, user: null });
                }
        },

        refreshToken: async () => {
                set({ checkingAuth: true });
                try {
                        // TODO: add refresh token endpoint when we harden auth
                        const data = await getCurrentUser();
                        set({ checkingAuth: false });
                        return data;
                } catch (error) {
                        set({ user: null, checkingAuth: false });
                        throw error;
                }
        },
}));

registerAuthHandlers({
        onRefresh: () => useUserStore.getState().refreshToken(),
        onLogout: () => useUserStore.setState({ user: null, checkingAuth: false }),
});
