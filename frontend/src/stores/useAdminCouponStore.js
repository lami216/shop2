import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

export const useAdminCouponStore = create((set, get) => ({
        coupons: [],
        loading: false,
        error: null,
        pagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10,
        },
        filters: {
                search: "",
                status: "all",
        },
        sort: {
                sortBy: "createdAt",
                sortOrder: "desc",
        },

        setFilters: (filters) => {
                set((state) => ({
                        filters: { ...state.filters, ...filters },
                        pagination: { ...state.pagination, page: 1 },
                }));
        },
        setPage: (page) => {
                set((state) => ({ pagination: { ...state.pagination, page } }));
        },
        setSort: (sort) => set({ sort }),

        fetchCoupons: async () => {
                const state = get();
                const params = {
                        page: state.pagination.page,
                        limit: state.pagination.limit,
                        search: state.filters.search,
                        status: state.filters.status !== "all" ? state.filters.status : undefined,
                        sortBy: state.sort.sortBy,
                        sortOrder: state.sort.sortOrder,
                };

                set({ loading: true, error: null });

                try {
                        const data = await apiClient.get("/coupons/admin", { params });
                        set({ coupons: data.data, pagination: data.pagination, loading: false });
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.couponFetchError");
                        toast.error(message);
                        set({ loading: false, error: message });
                }
        },

        createCoupons: async (payload) => {
                set({ loading: true });
                try {
                        const data = await apiClient.post("/coupons/admin", payload);
                        const created = Array.isArray(data.data) ? data.data : [data.data];
                        set((state) => ({
                                coupons: [...created, ...state.coupons],
                                loading: false,
                        }));
                        toast.success(translate("common.messages.couponCreated"));
                        await get().fetchCoupons();
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.couponCreateError");
                        toast.error(message);
                        set({ loading: false });
                        throw error;
                }
        },

        updateCoupon: async (id, payload) => {
                set({ loading: true });
                try {
                        const data = await apiClient.put(`/coupons/admin/${id}`, payload);
                        set((state) => ({
                                coupons: state.coupons.map((coupon) =>
                                        coupon._id === id ? data.data : coupon
                                ),
                                loading: false,
                        }));
                        toast.success(translate("common.messages.couponUpdated"));
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.couponUpdateError");
                        toast.error(message);
                        set({ loading: false });
                        throw error;
                }
        },

        toggleCoupon: async (id) => {
                try {
                        const data = await apiClient.patch(`/coupons/admin/${id}/toggle`);
                        set((state) => ({
                                coupons: state.coupons.map((coupon) =>
                                        coupon._id === id ? data.data : coupon
                                ),
                        }));
                        toast.success(translate("common.messages.couponToggled"));
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.couponToggleError");
                        toast.error(message);
                        throw error;
                }
        },

        deleteCoupon: async (id) => {
                set({ loading: true });
                try {
                        await apiClient.delete(`/coupons/admin/${id}`);
                        set((state) => ({
                                coupons: state.coupons.filter((coupon) => coupon._id !== id),
                                loading: false,
                        }));
                        toast.success(translate("common.messages.couponDeleted"));
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.couponDeleteError");
                        toast.error(message);
                        set({ loading: false });
                        throw error;
                }
        },
}));
