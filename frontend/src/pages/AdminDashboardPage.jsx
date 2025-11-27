import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";
import AdminOverview from "./admin/AdminOverview";
import AdminUsersPage from "./admin/AdminUsersPage";
import AdminTutorsPage from "./admin/AdminTutorsPage";
import AdminAdsPage from "./admin/AdminAdsPage";
import AdminPaymentsPage from "./admin/AdminPaymentsPage";
import AdminAcademicsPage from "./admin/AdminAcademicsPage";
import AdminBadgesPage from "./admin/AdminBadgesPage";
import useTranslation from "../hooks/useTranslation";

const AdminDashboardPage = () => {
        const { t, i18n } = useTranslation();
        const user = useUserStore((state) => state.user);
        const [currentSection, setCurrentSection] = useState("overview");

        const sections = useMemo(
                () => [
                        { key: "overview", label: t("admin.sections.overview") || "Overview", component: <AdminOverview /> },
                        { key: "users", label: t("admin.sections.users") || "Users", component: <AdminUsersPage /> },
                        { key: "tutors", label: t("admin.sections.tutors") || "Tutors", component: <AdminTutorsPage /> },
                        { key: "ads", label: t("admin.sections.ads") || "Ads", component: <AdminAdsPage /> },
                        { key: "payments", label: t("admin.sections.payments") || "Payments", component: <AdminPaymentsPage /> },
                        { key: "academics", label: t("admin.sections.academics") || "Academics", component: <AdminAcademicsPage /> },
                        { key: "badges", label: t("admin.sections.badges") || "Badges", component: <AdminBadgesPage /> },
                ],
                [t]
        );

        useEffect(() => {
                document.title = t("page.admin.title") || "Moltaqa";
        }, [i18n.language, t]);

        if (user && user.role !== "admin") {
                return <Navigate to='/' replace />;
        }

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto grid max-w-6xl gap-6 px-4 pb-24 pt-24 sm:grid-cols-4 sm:px-6 lg:px-8'>
                                <aside className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                        <h2 className='mb-4 text-xl font-bold text-kingdom-gold'>{t("nav.adminDashboard")}</h2>
                                        <nav className='flex flex-col gap-2'>
                                                {/* TODO: refactor to nested routes once admin area grows */}
                                                {sections.map((section) => (
                                                        <button
                                                                key={section.key}
                                                                className={`rounded-lg px-3 py-2 text-left text-sm transition-royal ${
                                                                        currentSection === section.key
                                                                                ? "bg-kingdom-purple/60 text-kingdom-gold"
                                                                                : "bg-black/20 text-kingdom-cream/80 hover:bg-kingdom-purple/20"
                                                                }`}
                                                                onClick={() => setCurrentSection(section.key)}
                                                        >
                                                                {section.label}
                                                        </button>
                                                ))}
                                        </nav>
                                </aside>

                                <main className='sm:col-span-3'>
                                        <div className='mb-4 flex items-center justify-between'>
                                                <div>
                                                        <h1 className='text-3xl font-bold text-kingdom-gold'>{t("page.admin.heading")}</h1>
                                                        <p className='text-sm text-kingdom-cream/70'>Basic admin tools to monitor and manage the platform.</p>
                                                </div>
                                        </div>
                                        <div className='rounded-2xl border border-kingdom-gold/20 bg-black/30 p-6 shadow-royal-soft'>
                                                {sections.find((section) => section.key === currentSection)?.component}
                                        </div>
                                </main>
                        </div>
                </div>
        );
};

export default AdminDashboardPage;
