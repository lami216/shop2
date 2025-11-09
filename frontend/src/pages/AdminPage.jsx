import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
        BarChart3,
        ClipboardList,
        FolderTree,
        PackageSearch,
        PlusCircle,
        TicketPercent,
} from "lucide-react";

import useTranslation from "../hooks/useTranslation";
import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import CategoryManager from "../components/CategoryManager";
import OrdersTab from "../components/OrdersTab";
import CouponsManager from "../components/CouponsManager";
import { useProductStore } from "../stores/useProductStore";

const AdminPage = () => {
        const [activeTab, setActiveTab] = useState("create");
        const { fetchAllProducts } = useProductStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchAllProducts();
        }, [fetchAllProducts]);

        const tabs = useMemo(
                () => [
                        { id: "create", label: t("admin.tabs.create"), icon: PlusCircle },
                        { id: "products", label: t("admin.tabs.products"), icon: PackageSearch },
                        { id: "categories", label: t("admin.tabs.categories"), icon: FolderTree },
                        { id: "analytics", label: t("admin.tabs.analytics"), icon: BarChart3 },
                        { id: "orders", label: t("admin.tabs.orders"), icon: ClipboardList },
                        { id: "coupons", label: t("admin.tabs.coupons"), icon: TicketPercent },
                ],
                [t]
        );

        return (
                <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-kingdom-plum via-[#110814] to-black'>
                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_transparent_55%)]' />
                        <div className='container relative z-10 mx-auto max-w-7xl px-4 py-20'>
                                <motion.div
                                        className='mx-auto max-w-3xl text-center'
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                >
                                        <span className='inline-flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-white/5 px-4 py-1 text-sm text-kingdom-gold/90'>
                                                لوحة تحكم مملكة العطور
                                        </span>
                                        <h1 className='mt-4 text-4xl font-semibold tracking-[0.14em] text-kingdom-cream sm:text-5xl'>
                                                {t("admin.dashboardTitle")}
                                        </h1>
                                        <p className='mt-4 text-base text-kingdom-cream/70'>
                                                {t("admin.dashboardSubtitle")}
                                        </p>
                                </motion.div>

                                <motion.nav
                                        className='mt-12 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-[0_32px_65px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-3'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                        {tabs.map((tab) => {
                                                const isActive = activeTab === tab.id;
                                                return (
                                                        <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`group flex items-center justify-between rounded-2xl border px-4 py-4 text-right transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-kingdom-gold/60 ${
                                                                        isActive
                                                                                ? "border-kingdom-gold/60 bg-gradient-to-br from-kingdom-gold/20 via-white/15 to-transparent text-kingdom-gold"
                                                                                : "border-white/10 bg-white/5 text-kingdom-cream/70 hover:border-kingdom-gold/40 hover:text-kingdom-cream"
                                                                }`}
                                                        >
                                                                <div className='flex flex-col gap-1 text-sm'>
                                                                        <span className='font-semibold tracking-[0.12em]'>{tab.label}</span>
                                                                        <span className='text-xs text-kingdom-cream/50 group-hover:text-kingdom-cream/70'>
                                                                                {t(`admin.tabDescriptions.${tab.id}`)}
                                                                        </span>
                                                                </div>
                                                                <span
                                                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-200 ${
                                                                                isActive
                                                                                        ? "border-kingdom-gold/60 bg-kingdom-gold/15 text-kingdom-gold"
                                                                                        : "border-white/10 bg-white/5 text-kingdom-cream/60"
                                                                        }`}
                                                                >
                                                                        <tab.icon className='h-5 w-5' />
                                                                </span>
                                                        </button>
                                                );
                                        })}
                                </motion.nav>

                                <div className='mt-12 space-y-10'>
                                        {activeTab === "create" && <CreateProductForm />}
                                        {activeTab === "products" && <ProductsList onEdit={() => setActiveTab("create")} />}
                                        {activeTab === "categories" && <CategoryManager />}
                                        {activeTab === "analytics" && <AnalyticsTab />}
                                        {activeTab === "orders" && <OrdersTab />}
                                        {activeTab === "coupons" && <CouponsManager />}
                                </div>
                        </div>
                </div>
        );
};
export default AdminPage;
