import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, MoreHorizontal, Plus, RefreshCw, Tag, TicketPercent, Trash2, X } from "lucide-react";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";
import { useAdminCouponStore } from "../stores/useAdminCouponStore";

const CouponsManager = () => {
        const {
                coupons,
                loading,
                pagination,
                filters,
                sort,
                fetchCoupons,
                setFilters,
                setPage,
                setSort,
                createCoupons,
                updateCoupon,
                toggleCoupon,
                deleteCoupon,
        } = useAdminCouponStore();
        const { t } = useTranslation();
        const [searchTerm, setSearchTerm] = useState(filters.search);
        const [modalState, setModalState] = useState({ open: false, mode: "single", coupon: null });

        useEffect(() => {
                fetchCoupons();
        }, [fetchCoupons]);

        useEffect(() => {
                const timeout = setTimeout(() => {
                        setFilters({ search: searchTerm });
                        fetchCoupons();
                }, 420);

                return () => clearTimeout(timeout);
        }, [searchTerm, setFilters, fetchCoupons]);

        const statusOptions = useMemo(
                () => [
                        { value: "all", label: t("coupons.filters.all") },
                        { value: "active", label: t("coupons.filters.active") },
                        { value: "inactive", label: t("coupons.filters.inactive") },
                ],
                [t]
        );

        const sortOptions = useMemo(
                () => [
                        { value: "createdAt", label: t("coupons.sort.createdAt") },
                        { value: "discountPercentage", label: t("coupons.sort.discount") },
                        { value: "expirationDate", label: t("coupons.sort.expiration") },
                        { value: "usageCount", label: t("coupons.sort.usage") },
                ],
                [t]
        );

        const handleStatusFilter = (status) => {
                setFilters({ status });
                fetchCoupons();
        };

        const handleSort = (value) => {
                setSort({ sortBy: value, sortOrder: sort.sortOrder });
                fetchCoupons();
        };

        const handleSortOrder = () => {
                setSort({ sortBy: sort.sortBy, sortOrder: sort.sortOrder === "desc" ? "asc" : "desc" });
                fetchCoupons();
        };

        const handlePageChange = (page) => {
                setPage(page);
                fetchCoupons();
        };

        const openCreateModal = (mode = "single") => {
                setModalState({ open: true, mode, coupon: null });
        };

        const openEditModal = (coupon) => {
                setModalState({ open: true, mode: "single", coupon });
        };

        const closeModal = () => setModalState((prev) => ({ ...prev, open: false, coupon: null }));

        const activeCount = coupons.filter((coupon) => coupon.isActive).length;
        const inactiveCount = coupons.length - activeCount;

        return (
                <motion.section
                        className='rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                >
                        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                                <div>
                                        <h2 className='text-2xl font-semibold tracking-[0.14em] text-kingdom-cream'>
                                                {t("coupons.title")}
                                        </h2>
                                        <p className='mt-2 text-sm text-kingdom-cream/70'>{t("coupons.subtitle")}</p>
                                </div>
                                <div className='flex flex-wrap items-center gap-3'>
                                        <button
                                                type='button'
                                                onClick={() => openCreateModal("single")}
                                                className='inline-flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-kingdom-gold/10 px-4 py-2 text-sm font-semibold text-kingdom-gold transition hover:bg-kingdom-gold/20'
                                        >
                                                <Plus className='h-4 w-4' />
                                                {t("coupons.actions.createSingle")}
                                        </button>
                                        <button
                                                type='button'
                                                onClick={() => openCreateModal("bulk")}
                                                className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-kingdom-cream/80 transition hover:border-kingdom-gold/40 hover:text-kingdom-cream'
                                        >
                                                <RefreshCw className='h-4 w-4' />
                                                {t("coupons.actions.createBulk")}
                                        </button>
                                </div>
                        </div>

                        <div className='mt-8 grid gap-4 md:grid-cols-3'>
                                <CouponStatCard
                                        title={t("coupons.metrics.total")}
                                        value={pagination.total}
                                        icon={TicketPercent}
                                        accent='from-kingdom-gold/45 via-kingdom-gold/20 to-transparent'
                                />
                                <CouponStatCard
                                        title={t("coupons.metrics.active")}
                                        value={activeCount}
                                        icon={Tag}
                                        accent='from-emerald-500/30 via-emerald-400/15 to-transparent'
                                />
                                <CouponStatCard
                                        title={t("coupons.metrics.inactive")}
                                        value={inactiveCount}
                                        icon={Calendar}
                                        accent='from-red-400/30 via-red-400/15 to-transparent'
                                />
                        </div>

                        <div className='mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                                <label
                                        className='flex h-12 w-full items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/10 px-4 text-sm text-kingdom-cream/70 shadow-[0_15px_35px_-28px_rgba(0,0,0,0.7)] focus-within:border-kingdom-gold/60 lg:max-w-sm'
                                        aria-label={t("coupons.filters.searchPlaceholder")}
                                >
                                        <input
                                                type='search'
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder={t("coupons.filters.searchPlaceholder")}
                                                className='w-full bg-transparent text-sm text-kingdom-cream placeholder:text-kingdom-cream/40 focus:outline-none'
                                        />
                                </label>
                                <div className='flex flex-wrap items-center gap-3 text-sm text-kingdom-cream/70'>
                                        <select
                                                value={filters.status}
                                                onChange={(event) => handleStatusFilter(event.target.value)}
                                                className='rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right text-sm font-semibold text-kingdom-cream focus:outline-none'
                                        >
                                                {statusOptions.map((option) => (
                                                        <option key={option.value} value={option.value} className='bg-kingdom-plum text-kingdom-cream'>
                                                                {option.label}
                                                        </option>
                                                ))}
                                        </select>
                                        <div className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2'>
                                                <select
                                                        value={sort.sortBy}
                                                        onChange={(event) => handleSort(event.target.value)}
                                                        className='bg-transparent text-right text-sm font-semibold text-kingdom-cream focus:outline-none'
                                                >
                                                        {sortOptions.map((option) => (
                                                                <option key={option.value} value={option.value} className='bg-kingdom-plum text-kingdom-cream'>
                                                                        {option.label}
                                                                </option>
                                                        ))}
                                                </select>
                                                <button
                                                        type='button'
                                                        onClick={handleSortOrder}
                                                        className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-kingdom-cream/70 transition hover:border-kingdom-gold/40 hover:text-kingdom-gold'
                                                >
                                                        <MoreHorizontal className={`h-4 w-4 ${sort.sortOrder === "asc" ? "rotate-90" : ""}`} />
                                                </button>
                                        </div>
                                </div>
                        </div>

                        <div className='mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.8)]'>
                                <div className='hidden grid-cols-[repeat(6,minmax(0,1fr))] items-center gap-4 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-kingdom-cream/60 lg:grid'>
                                        <span>{t("coupons.table.code")}</span>
                                        <span>{t("coupons.table.discount")}</span>
                                        <span>{t("coupons.table.expiration")}</span>
                                        <span>{t("coupons.table.usage")}</span>
                                        <span>{t("coupons.table.status")}</span>
                                        <span>{t("coupons.table.actions")}</span>
                                </div>
                                <div className='divide-y divide-white/5'>
                                        <AnimatePresence mode='popLayout'>
                                                {loading && (
                                                        <motion.div
                                                                key='coupons-loading'
                                                                className='flex items-center justify-center gap-3 px-6 py-10 text-kingdom-cream/70'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                        >
                                                                <Loader2 className='h-5 w-5 animate-spin' />
                                                                {t("coupons.loading")}
                                                        </motion.div>
                                                )}
                                                {!loading && coupons.length === 0 && (
                                                        <motion.div
                                                                key='coupons-empty'
                                                                className='px-6 py-12 text-center text-kingdom-cream/60'
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                        >
                                                                {t("coupons.empty")}
                                                        </motion.div>
                                                )}
                                                {!loading && coupons.map((coupon) => (
                                                        <CouponRow
                                                                key={coupon._id}
                                                                coupon={coupon}
                                                                onToggle={toggleCoupon}
                                                                onDelete={deleteCoupon}
                                                                onEdit={openEditModal}
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

                        <CouponModal
                                open={modalState.open}
                                mode={modalState.mode}
                                coupon={modalState.coupon}
                                onClose={closeModal}
                                onCreate={createCoupons}
                                onUpdate={updateCoupon}
                        />
                </motion.section>
        );
};

const CouponStatCard = ({ title, value, icon: Icon, accent }) => (
        <motion.div
                className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-right text-kingdom-cream shadow-[0_22px_45px_-30px_rgba(0,0,0,0.75)]'
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
        >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
                <div className='relative z-10 flex items-center justify-between gap-3'>
                        <div>
                                <p className='text-xs uppercase tracking-[0.2em] text-kingdom-cream/60'>{title}</p>
                                <p className='text-2xl font-semibold tracking-wide text-kingdom-cream'>{value}</p>
                        </div>
                        <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-kingdom-cream/70'>
                                <Icon className='h-5 w-5' />
                        </div>
                </div>
        </motion.div>
);

const CouponRow = ({ coupon, onToggle, onDelete, onEdit }) => {
        const { t } = useTranslation();
        const expirationLabel = coupon.expirationDate
                ? new Date(coupon.expirationDate).toLocaleDateString()
                : t("coupons.table.noExpiration");

        const usageLabel = coupon.usageLimit > 0
                ? `${coupon.usageCount}/${coupon.usageLimit}`
                : `${coupon.usageCount}`;

        return (
                <motion.div
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        className='grid gap-4 px-6 py-6 text-sm text-kingdom-cream/80 lg:grid-cols-[repeat(6,minmax(0,1fr))] lg:items-center'
                >
                        <div className='space-y-1'>
                                <p className='text-base font-semibold text-kingdom-cream'>{coupon.code}</p>
                                {coupon.label && <p className='text-xs text-kingdom-cream/50'>{coupon.label}</p>}
                        </div>
                        <div className='text-base font-semibold text-kingdom-gold'>
                                %{coupon.discountPercentage}
                        </div>
                        <div className='text-sm text-kingdom-cream'>{expirationLabel}</div>
                        <div className='text-sm text-kingdom-cream/70'>{usageLabel}</div>
                        <div>
                                <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                coupon.isActive
                                                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                                                        : "border-red-400/50 bg-red-400/10 text-red-200"
                                        }`}
                                >
                                        {coupon.isActive ? t("coupons.status.active") : t("coupons.status.inactive")}
                                </span>
                        </div>
                        <div className='flex flex-wrap items-center gap-2 text-xs'>
                                <button
                                        type='button'
                                        onClick={() => onToggle(coupon._id)}
                                        className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-kingdom-cream/70 transition hover:border-kingdom-gold/40 hover:text-kingdom-gold'
                                >
                                        {coupon.isActive ? t("coupons.actions.deactivate") : t("coupons.actions.activate")}
                                </button>
                                <button
                                        type='button'
                                        onClick={() => onEdit(coupon)}
                                        className='rounded-full border border-kingdom-gold/40 bg-kingdom-gold/10 px-3 py-1 text-kingdom-gold transition hover:bg-kingdom-gold/20'
                                >
                                        {t("coupons.actions.edit")}
                                </button>
                                <button
                                        type='button'
                                        onClick={() => onDelete(coupon._id)}
                                        className='inline-flex items-center gap-1 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-red-200 transition hover:bg-red-500/20'
                                >
                                        <Trash2 className='h-3.5 w-3.5' />
                                        {t("coupons.actions.delete")}
                                </button>
                        </div>
                </motion.div>
        );
};

const CouponModal = ({ open, onClose, mode, coupon, onCreate, onUpdate }) => {
        const { t } = useTranslation();
        const [currentMode, setCurrentMode] = useState(mode);
        const [formState, setFormState] = useState(() => createInitialState(mode));
        const isEditing = Boolean(coupon);

        useEffect(() => {
                setCurrentMode(mode);
                setFormState(createInitialState(mode, coupon));
        }, [mode, coupon, open]);

        const handleChange = (event) => {
                const { name, value } = event.target;
                setFormState((previous) => ({ ...previous, [name]: value }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();

                try {
                        if (isEditing && coupon) {
                                await onUpdate(coupon._id, {
                                        code: formState.code,
                                        label: formState.label,
                                        description: formState.description,
                                        discountPercentage: Number(formState.discountPercentage),
                                        usageLimit: Number(formState.usageLimit),
                                        minOrderValue: Number(formState.minOrderValue),
                                        startDate: formState.startDate || undefined,
                                        expirationDate: formState.expirationDate || undefined,
                                });
                        } else {
                                const payload = {
                                        mode: currentMode,
                                        code: formState.code,
                                        label: formState.label,
                                        description: formState.description,
                                        discountPercentage: Number(formState.discountPercentage),
                                        usageLimit: Number(formState.usageLimit),
                                        minOrderValue: Number(formState.minOrderValue),
                                        startDate: formState.startDate || undefined,
                                        expirationDate: formState.expirationDate || undefined,
                                        quantity: Number(formState.quantity),
                                        prefix: formState.prefix,
                                        length: Number(formState.length),
                                };

                                await onCreate(payload);
                        }
                        onClose();
                } catch (error) {
                        console.error("Failed to save coupon", error);
                }
        };

        return (
                <AnimatePresence>
                        {open && (
                                <motion.div
                                        className='fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                >
                                        <motion.div
                                                className='w-full max-w-3xl rounded-3xl border border-white/10 bg-kingdom-plum/95 p-6 text-kingdom-cream shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]'
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                        >
                                                <div className='flex flex-wrap items-start justify-between gap-4'>
                                                        <div>
                                                                <h3 className='text-lg font-semibold tracking-[0.1em] text-kingdom-cream'>
                                                                        {isEditing
                                                                                ? t("coupons.modal.editTitle", { code: coupon?.code })
                                                                                : mode === "bulk"
                                                                                        ? t("coupons.modal.bulkTitle")
                                                                                        : t("coupons.modal.createTitle")}
                                                                </h3>
                                                                <p className='mt-2 text-sm text-kingdom-cream/70'>
                                                                        {t("coupons.modal.subtitle")}
                                                                </p>
                                                        </div>
                                                        <button
                                                                type='button'
                                                                onClick={onClose}
                                                                className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-kingdom-cream/70 hover:border-kingdom-cream/40'
                                                                aria-label={t("common.actions.close")}
                                                        >
                                                                <X className='h-4 w-4' />
                                                        </button>
                                                </div>

                                                {!isEditing && (
                                                        <div className='mt-5 flex items-center gap-3 text-sm text-kingdom-cream/70'>
                                                                <label className='inline-flex items-center gap-2'>
                                                                        <input
                                                                                type='radio'
                                                                                name='mode'
                                                                                value='single'
                                                                                checked={currentMode === "single"}
                                                                                onChange={() => {
                                                                                        setCurrentMode("single");
                                                                                        setFormState(createInitialState("single", coupon));
                                                                                }}
                                                                                className='h-4 w-4 rounded border-white/20 bg-transparent text-kingdom-gold focus:ring-kingdom-gold'
                                                                        />
                                                                        {t("coupons.modal.singleMode")}
                                                                </label>
                                                                <label className='inline-flex items-center gap-2'>
                                                                        <input
                                                                                type='radio'
                                                                                name='mode'
                                                                                value='bulk'
                                                                                checked={currentMode === "bulk"}
                                                                                onChange={() => {
                                                                                        setCurrentMode("bulk");
                                                                                        setFormState(createInitialState("bulk", coupon));
                                                                                }}
                                                                                className='h-4 w-4 rounded border-white/20 bg-transparent text-kingdom-gold focus:ring-kingdom-gold'
                                                                        />
                                                                        {t("coupons.modal.bulkMode")}
                                                                </label>
                                                        </div>
                                                )}

                                                <form onSubmit={handleSubmit} className='mt-6 grid gap-4 md:grid-cols-2'>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.code")}
                                                                </label>
                                                                <input
                                                                        name='code'
                                                                        value={formState.code}
                                                                        onChange={handleChange}
                                                                        disabled={currentMode === "bulk" && !isEditing}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none disabled:cursor-not-allowed disabled:bg-black/20'
                                                                        placeholder={currentMode === "bulk" ? t("coupons.fields.codeHintBulk") : t("coupons.fields.codeHint")}
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.label")}
                                                                </label>
                                                                <input
                                                                        name='label'
                                                                        value={formState.label}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2 md:col-span-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.description")}
                                                                </label>
                                                                <textarea
                                                                        name='description'
                                                                        rows={3}
                                                                        value={formState.description}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.discount")}
                                                                </label>
                                                                <input
                                                                        name='discountPercentage'
                                                                        type='number'
                                                                        min='1'
                                                                        max='100'
                                                                        value={formState.discountPercentage}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.usageLimit")}
                                                                </label>
                                                                <input
                                                                        name='usageLimit'
                                                                        type='number'
                                                                        min='0'
                                                                        value={formState.usageLimit}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.minOrder")}
                                                                </label>
                                                                <input
                                                                        name='minOrderValue'
                                                                        type='number'
                                                                        min='0'
                                                                        value={formState.minOrderValue}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.startDate")}
                                                                </label>
                                                                <input
                                                                        name='startDate'
                                                                        type='date'
                                                                        value={formState.startDate}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        <div className='space-y-2'>
                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                        {t("coupons.fields.expirationDate")}
                                                                </label>
                                                                <input
                                                                        name='expirationDate'
                                                                        type='date'
                                                                        value={formState.expirationDate}
                                                                        onChange={handleChange}
                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                />
                                                        </div>
                                                        {currentMode === "bulk" && !isEditing && (
                                                                <>
                                                                        <div className='space-y-2'>
                                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                                        {t("coupons.fields.quantity")}
                                                                                </label>
                                                                                <input
                                                                                        name='quantity'
                                                                                        type='number'
                                                                                        min='1'
                                                                                        max='200'
                                                                                        value={formState.quantity}
                                                                                        onChange={handleChange}
                                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                                />
                                                                        </div>
                                                                        <div className='space-y-2'>
                                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                                        {t("coupons.fields.prefix")}
                                                                                </label>
                                                                                <input
                                                                                        name='prefix'
                                                                                        value={formState.prefix}
                                                                                        onChange={handleChange}
                                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                                />
                                                                        </div>
                                                                        <div className='space-y-2'>
                                                                                <label className='text-xs font-semibold uppercase tracking-[0.2em] text-kingdom-cream/60'>
                                                                                        {t("coupons.fields.length")}
                                                                                </label>
                                                                                <input
                                                                                        name='length'
                                                                                        type='number'
                                                                                        min='4'
                                                                                        max='12'
                                                                                        value={formState.length}
                                                                                        onChange={handleChange}
                                                                                        className='w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-kingdom-cream focus:border-kingdom-gold/60 focus:outline-none'
                                                                                />
                                                                        </div>
                                                                </>
                                                        )}

                                                        <div className='md:col-span-2 mt-6 flex justify-end gap-3'>
                                                                <button
                                                                        type='button'
                                                                        onClick={onClose}
                                                                        className='inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-kingdom-cream/70 transition hover:border-kingdom-cream/30 hover:text-kingdom-cream'
                                                                >
                                                                        {t("common.actions.cancel")}
                                                                </button>
                                                                <button
                                                                        type='submit'
                                                                        className='inline-flex items-center justify-center rounded-full border border-kingdom-gold/40 bg-kingdom-gold/20 px-5 py-2 text-sm font-semibold text-kingdom-gold transition hover:bg-kingdom-gold/30'
                                                                >
                                                                        {isEditing ? t("coupons.modal.update") : t("coupons.modal.create")}
                                                                </button>
                                                        </div>
                                                </form>
                                        </motion.div>
                                </motion.div>
                        )}
                </AnimatePresence>
        );
};

const createInitialState = (mode, coupon) => ({
        code: coupon?.code || "",
        label: coupon?.label || "",
        description: coupon?.description || "",
        discountPercentage: coupon?.discountPercentage ?? "",
        usageLimit: coupon?.usageLimit ?? "0",
        minOrderValue: coupon?.minOrderValue ?? "0",
        startDate: coupon?.startDate ? coupon.startDate.split("T")[0] : "",
        expirationDate: coupon?.expirationDate ? coupon.expirationDate.split("T")[0] : "",
        quantity: mode === "bulk" ? 10 : 1,
        prefix: "KING-",
        length: 6,
});

export default CouponsManager;

const couponShape = PropTypes.shape({
        _id: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        label: PropTypes.string,
        description: PropTypes.string,
        discountPercentage: PropTypes.number.isRequired,
        usageLimit: PropTypes.number,
        usageCount: PropTypes.number,
        minOrderValue: PropTypes.number,
        startDate: PropTypes.string,
        expirationDate: PropTypes.string,
        isActive: PropTypes.bool,
});

CouponStatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        icon: PropTypes.elementType.isRequired,
        accent: PropTypes.string.isRequired,
};

CouponRow.propTypes = {
        coupon: couponShape.isRequired,
        onToggle: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
};

CouponModal.propTypes = {
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        mode: PropTypes.oneOf(["single", "bulk"]).isRequired,
        coupon: couponShape,
        onCreate: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
};
