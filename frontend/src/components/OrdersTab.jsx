import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Search, Slash, X } from "lucide-react";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";
import { ORDER_STATUSES, useOrderStore } from "../stores/useOrderStore";
import { formatMRU } from "../lib/formatMRU";

const OrdersTab = () => {
        const {
                orders,
                loading,
                error,
                pagination,
                filters,
                fetchOrders,
                setFilters,
                setPage,
                updateOrderStatus,
                cancelOrder,
        } = useOrderStore();
        const { t } = useTranslation();
        const [searchTerm, setSearchTerm] = useState(filters.search);
        const [cancelContext, setCancelContext] = useState(null);

        useEffect(() => {
                fetchOrders();
        }, [fetchOrders]);

        useEffect(() => {
                const handler = setTimeout(() => {
                        setFilters({ search: searchTerm });
                        fetchOrders({ page: 1, search: searchTerm });
                }, 420);

                return () => clearTimeout(handler);
        }, [searchTerm, setFilters, fetchOrders]);

        const statusOptions = useMemo(
                () => [{ value: "all", label: t("orders.filters.all") }, ...ORDER_STATUSES.map((status) => ({
                        value: status,
                        label: t(`orders.status.${status}`),
                }))],
                [t]
        );

        const handleStatusChange = (orderId, status) => {
                updateOrderStatus(orderId, { status }).catch((error) => {
                        console.error("Failed to update order status", error);
                });
        };

        const handleCancel = (orderId, reason) => {
                cancelOrder(orderId, reason)
                        .then(() => setCancelContext(null))
                        .catch((error) => {
                                console.error("Failed to cancel order", error);
                        });
        };

        const handleStatusFilter = (status) => {
                setFilters({ status });
                fetchOrders({ page: 1, status });
        };

        const handlePageChange = (page) => {
                setPage(page);
                fetchOrders({ page });
        };

        const totalValue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        const totalItems = orders.reduce((acc, order) => acc + (order.totalQuantity || 0), 0);

        return (
                <motion.section
                        className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl'
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                >
                        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                                <div>
                                        <h2 className='text-2xl font-semibold tracking-[0.14em] text-kingdom-cream'>
                                                {t("orders.title")}
                                        </h2>
                                        <p className='mt-2 text-sm text-kingdom-cream/70'>{t("orders.subtitle")}</p>
                                </div>
                                <div className='grid gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:gap-4'>
                                        <label
                                                className='relative flex h-12 w-full items-center overflow-hidden rounded-full border border-white/10 bg-white/10 px-4 text-sm text-kingdom-cream/70 shadow-[0_15px_35px_-28px_rgba(0,0,0,0.7)] focus-within:border-kingdom-gold/60 sm:col-span-2 lg:w-72'
                                                aria-label={t("orders.filters.searchPlaceholder")}
                                        >
                                                <Search className='h-4 w-4 text-kingdom-cream/50' />
                                                <input
                                                        type='search'
                                                        value={searchTerm}
                                                        onChange={(event) => setSearchTerm(event.target.value)}
                                                        placeholder={t("orders.filters.searchPlaceholder")}
                                                        className='w-full bg-transparent px-3 py-2 text-sm text-kingdom-cream placeholder:text-kingdom-cream/40 focus:outline-none'
                                                />
                                                {searchTerm && (
                                                        <button
                                                                type='button'
                                                                onClick={() => setSearchTerm("")}
                                                                className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-kingdom-cream/70 transition hover:bg-white/20'
                                                                aria-label={t("common.actions.clear")}
                                                        >
                                                                <Slash className='h-3.5 w-3.5' />
                                                        </button>
                                                )}
                                        </label>
                                        <div className='relative rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-kingdom-cream/80 shadow-[0_15px_35px_-28px_rgba(0,0,0,0.7)]'>
                                                <select
                                                        value={filters.status}
                                                        onChange={(event) => handleStatusFilter(event.target.value)}
                                                        className='w-full appearance-none bg-transparent text-right text-sm font-medium text-kingdom-cream focus:outline-none'
                                                >
                                                        {statusOptions.map((option) => (
                                                                <option key={option.value} value={option.value} className='bg-kingdom-plum text-kingdom-cream'>
                                                                        {option.label}
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>
                                </div>
                        </div>

                        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                                <StatsCard
                                        title={t("orders.metrics.totalRevenue")}
                                        value={formatMRU(totalValue)}
                                        accent='from-kingdom-gold/60 via-kingdom-gold/30 to-transparent'
                                />
                                <StatsCard
                                        title={t("orders.metrics.totalOrders")}
                                        value={pagination.total}
                                        accent='from-white/40 via-white/15 to-transparent'
                                />
                                <StatsCard
                                        title={t("orders.metrics.totalItems")}
                                        value={totalItems}
                                        accent='from-kingdom-purple/50 via-kingdom-purple/25 to-transparent'
                                />
                                <StatsCard
                                        title={t("orders.metrics.pending")}
                                        value={orders.filter((order) => order.status === "pending").length}
                                        accent='from-red-500/40 via-red-500/25 to-transparent'
                                />
                        </div>

                        <div className='mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.8)]'>
                                <div className='hidden grid-cols-[2fr_repeat(4,1fr)] items-center gap-4 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-kingdom-cream/60 lg:grid'>
                                        <span>{t("orders.table.customer")}</span>
                                        <span>{t("orders.table.items")}</span>
                                        <span>{t("orders.table.total")}</span>
                                        <span>{t("orders.table.payment")}</span>
                                        <span>{t("orders.table.status")}</span>
                                        <span>{t("orders.table.actions")}</span>
                                </div>
                                <div className='divide-y divide-white/5'>
                                        <AnimatePresence mode='popLayout'>
                                                {loading && (
                                                        <motion.div
                                                                key='orders-loading'
                                                                className='flex items-center justify-center gap-3 px-6 py-10 text-kingdom-cream/70'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                        >
                                                                <Loader2 className='h-5 w-5 animate-spin' />
                                                                {t("orders.loading")}
                                                        </motion.div>
                                                )}
                                                {!loading && error && (
                                                        <motion.div
                                                                key='orders-error'
                                                                className='flex items-center justify-center gap-3 px-6 py-10 text-red-300'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                        >
                                                                <AlertTriangle className='h-5 w-5' />
                                                                {error}
                                                        </motion.div>
                                                )}
                                                {!loading && !error && orders.length === 0 && (
                                                        <motion.div
                                                                key='orders-empty'
                                                                className='flex items-center justify-center gap-3 px-6 py-12 text-kingdom-cream/60'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                        >
                                                                {t("orders.empty")}
                                                        </motion.div>
                                                )}
                                                {!loading && !error && orders.map((order) => (
                                                        <OrderRow
                                                                key={order._id}
                                                                order={order}
                                                                onStatusChange={handleStatusChange}
                                                                onCancel={() =>
                                                                        setCancelContext({
                                                                                orderId: order._id,
                                                                                customerName: order?.customer?.name,
                                                                        })
                                                                }
                                                                disabled={order.status === "cancelled"}
                                                        />
                                                ))}
                                        </AnimatePresence>
                                </div>
                        </div>

                        {pagination.pages > 1 && (
                                <div className='mt-8 flex justify-center gap-2 text-sm text-kingdom-cream/70'>
                                        {Array.from({ length: pagination.pages }).map((_, index) => {
                                                const page = index + 1;
                                                const isActive = page === pagination.page;
                                                return (
                                                        <button
                                                                key={page}
                                                                type='button'
                                                                onClick={() => handlePageChange(page)}
                                                                className={`min-w-[2.5rem] rounded-full border px-3 py-1 transition ${
                                                                        isActive
                                                                                ? "border-kingdom-gold/70 bg-kingdom-gold/20 text-kingdom-gold"
                                                                                : "border-white/10 bg-white/5 hover:border-kingdom-gold/40"
                                                                }`}
                                                        >
                                                                {page}
                                                        </button>
                                                );
                                        })}
                                </div>
                        )}

                        <CancelOrderModal
                                context={cancelContext}
                                onDismiss={() => setCancelContext(null)}
                                onConfirm={handleCancel}
                        />
                </motion.section>
        );
};

const StatsCard = ({ title, value, accent }) => (
        <motion.div
                className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-right text-kingdom-cream shadow-[0_22px_45px_-30px_rgba(0,0,0,0.75)]'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
        >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
                <div className='relative z-10 space-y-2'>
                        <p className='text-xs uppercase tracking-[0.2em] text-kingdom-cream/60'>{title}</p>
                        <p className='text-2xl font-semibold tracking-wide text-kingdom-cream'>{value}</p>
                </div>
        </motion.div>
);

const OrderRow = ({ order, onStatusChange, onCancel, disabled }) => {
        const { t } = useTranslation();
        const paymentLabel = order.paymentMethod ? t(`orders.payment.${order.paymentMethod}`) : "-";

        return (
                <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        className='grid gap-4 px-6 py-6 text-sm text-kingdom-cream/80 lg:grid-cols-[2fr_repeat(4,1fr)] lg:items-center'
                >
                        <div className='space-y-2'>
                                <p className='text-base font-semibold text-kingdom-cream'>
                                        {order.customer?.name || t("orders.customer.unknown")}
                                </p>
                                <p className='text-xs text-kingdom-cream/60'>
                                        {order.customer?.phone && <span>{t("orders.customer.phone", { phone: order.customer.phone })}</span>}
                                        {order.customer?.email && (
                                                <span className='ml-2'>{t("orders.customer.email", { email: order.customer.email })}</span>
                                        )}
                                </p>
                                {order.notes && (
                                        <p className='text-xs text-kingdom-cream/50'>{order.notes}</p>
                                )}
                        </div>

                        <div className='flex flex-col gap-1 text-xs font-medium text-kingdom-cream/70'>
                                <span>{t("orders.table.totalItems")}</span>
                                <span className='text-base font-semibold text-kingdom-cream'>{order.totalQuantity}</span>
                        </div>
                        <div className='flex flex-col gap-1 text-xs font-medium text-kingdom-cream/70'>
                                <span>{t("orders.table.totalAmount")}</span>
                                <span className='text-base font-semibold text-kingdom-gold'>{formatMRU(order.totalAmount)}</span>
                        </div>
                        <div className='flex flex-col gap-1 text-xs font-medium text-kingdom-cream/70'>
                                <span>{t("orders.table.payment")}</span>
                                <span className='text-base font-semibold text-kingdom-cream'>{paymentLabel}</span>
                        </div>
                        <div className='flex flex-col gap-2 text-xs text-kingdom-cream/70'>
                                <span>{t("orders.table.status")}</span>
                                <div className='relative'>
                                        <select
                                                value={order.status}
                                                onChange={(event) => onStatusChange(order._id, event.target.value)}
                                                disabled={disabled}
                                                className={`w-full rounded-full border px-3 py-2 text-sm font-semibold focus:outline-none ${
                                                        disabled
                                                                ? "border-white/10 bg-white/5 text-kingdom-cream/40"
                                                                : "border-kingdom-gold/40 bg-kingdom-gold/10 text-kingdom-cream/90"
                                                }`}
                                        >
                                                {ORDER_STATUSES.map((status) => (
                                                        <option key={status} value={status} className='bg-kingdom-plum text-kingdom-cream'>
                                                                {t(`orders.status.${status}`)}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                        </div>
                        <div className='flex flex-wrap items-center gap-2 text-xs'>
                                <button
                                        type='button'
                                        onClick={onCancel}
                                        disabled={disabled}
                                        className='inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-kingdom-cream/30'
                                >
                                        {t("orders.actions.cancel")}
                                </button>
                        </div>
                </motion.div>
        );
};

const CancelOrderModal = ({ context, onDismiss, onConfirm }) => {
        const { t } = useTranslation();
        const [reason, setReason] = useState("");

        useEffect(() => {
                if (!context) {
                        setReason("");
                }
        }, [context]);

        return (
                <AnimatePresence>
                        {context && (
                                <motion.div
                                        className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                >
                                        <motion.div
                                                className='w-full max-w-md rounded-3xl border border-white/10 bg-kingdom-plum/95 p-6 text-kingdom-cream shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]'
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                        >
                                                <div className='flex items-start justify-between gap-4'>
                                                        <div>
                                                                <h3 className='text-lg font-semibold tracking-[0.1em] text-red-200'>
                                                                        {t("orders.cancel.title", { name: context.customerName || t("orders.customer.unknown") })}
                                                                </h3>
                                                                <p className='mt-2 text-sm text-kingdom-cream/70'>{t("orders.cancel.subtitle")}</p>
                                                        </div>
                                                        <button
                                                                type='button'
                                                                onClick={onDismiss}
                                                                className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-kingdom-cream/70 hover:border-kingdom-cream/40'
                                                                aria-label={t("common.actions.close")}
                                                        >
                                                                <X className='h-4 w-4' />
                                                        </button>
                                                </div>
                                                <div className='mt-6 space-y-3'>
                                                        <label className='text-xs font-medium uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                {t("orders.cancel.reason")}
                                                        </label>
                                                        <textarea
                                                                rows={4}
                                                                value={reason}
                                                                onChange={(event) => setReason(event.target.value)}
                                                                className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                placeholder={t("orders.cancel.placeholder")}
                                                        />
                                                </div>
                                                <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end'>
                                                        <button
                                                                type='button'
                                                                onClick={onDismiss}
                                                                className='inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-kingdom-cream/70 transition hover:border-kingdom-cream/30 hover:text-kingdom-cream'
                                                        >
                                                                {t("common.actions.back")}
                                                        </button>
                                                        <button
                                                                type='button'
                                                                onClick={() => onConfirm(context.orderId, reason)}
                                                                className='inline-flex items-center justify-center rounded-full border border-red-400/50 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20'
                                                        >
                                                                {t("orders.cancel.confirm")}
                                                        </button>
                                                </div>
                                        </motion.div>
                                </motion.div>
                        )}
                </AnimatePresence>
        );
};

export default OrdersTab;

const customerShape = PropTypes.shape({
        name: PropTypes.string,
        phone: PropTypes.string,
        email: PropTypes.string,
});

const orderShape = PropTypes.shape({
        _id: PropTypes.string.isRequired,
        customer: customerShape,
        totalQuantity: PropTypes.number.isRequired,
        totalAmount: PropTypes.number.isRequired,
        paymentMethod: PropTypes.string,
        status: PropTypes.string.isRequired,
        notes: PropTypes.string,
});

StatsCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        accent: PropTypes.string.isRequired,
};

OrderRow.propTypes = {
        order: orderShape.isRequired,
        onStatusChange: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
};

CancelOrderModal.propTypes = {
        context: PropTypes.shape({
                orderId: PropTypes.string.isRequired,
                customerName: PropTypes.string,
        }),
        onDismiss: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
};
