import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import { translate } from "../lib/locale";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "completed", "cancelled"];

export const useOrderStore = create((set, get) => ({
        orders: [],
        loading: false,
        error: null,
        pagination: {
                page: 1,
                pages: 1,
                limit: 10,
                total: 0,
        },
        filters: {
                status: "all",
                search: "",
        },
        sort: {
                sortBy: "createdAt",
                sortOrder: "desc",
        },

        setFilters: (nextFilters) => {
                set((state) => ({
                        filters: { ...state.filters, ...nextFilters },
                        pagination: { ...state.pagination, page: 1 },
                }));
        },

        setPage: (page) => {
                set((state) => ({
                        pagination: { ...state.pagination, page },
                }));
        },

        setSort: (sort) => {
                set({ sort });
        },

        fetchOrders: async (options = {}) => {
                const state = get();
                const params = {
                        page: options.page ?? state.pagination.page,
                        limit: state.pagination.limit,
                        status: options.status ?? state.filters.status,
                        search: options.search ?? state.filters.search,
                        sortBy: state.sort.sortBy,
                        sortOrder: state.sort.sortOrder,
                };

                set({ loading: true, error: null });

                try {
                        const data = await apiClient.get("/orders", { params });
                        set({ orders: data.data, pagination: data.pagination, loading: false });
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.fetchOrdersError");
                        set({ loading: false, error: message });
                        toast.error(message);
                }
        },

        updateOrderStatus: async (orderId, payload) => {
                set({ loading: true });

                try {
                        const data = await apiClient.patch(`/orders/${orderId}`, payload);
                        set((state) => ({
                                orders: state.orders.map((order) =>
                                        order._id === orderId ? data.data : order
                                ),
                                loading: false,
                        }));
                        toast.success(translate("common.messages.orderStatusUpdated"));
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.updateOrderStatusError");
                        set({ loading: false });
                        toast.error(message);
                        throw error;
                }
        },

        cancelOrder: async (orderId, reason) => {
                set({ loading: true });
                try {
                        const data = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
                        set((state) => ({
                                orders: state.orders.map((order) =>
                                        order._id === orderId ? data.data : order
                                ),
                                loading: false,
                        }));
                        toast.success(translate("common.messages.orderCancelled"));
                } catch (error) {
                        const message = error.response?.data?.message || translate("toast.cancelOrderError");
                        set({ loading: false });
                        toast.error(message);
                        throw error;
                }
        },
}));
