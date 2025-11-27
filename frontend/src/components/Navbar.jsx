import { UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import LogoMoltaqa from "./LogoMoltaqa";

const arabesquePattern = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'>
                <path d='M100 10L120 40L160 50L130 80L140 120L100 100L60 120L70 80L40 50L80 40L100 10Z' stroke='white' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/>
                <circle cx='100' cy='100' r='32' stroke='white' stroke-width='0.8' fill='none'/>
                <path d='M100 70C113 76 123 88 123 102C123 116 113 128 100 134C87 128 77 116 77 102C77 88 87 76 100 70Z' stroke='white' stroke-width='0.6' fill='none'/>
        </svg>`
);

const Navbar = () => {
        const { user, logout } = useUserStore();
        const isAdmin = user?.role === "admin";
        const profileLink = user?.role === "tutor" ? "/tutor/profile" : user?.role === "admin" ? "/admin" : "/student/profile";
        const { t, i18n } = useTranslation();
        const activeLanguage = i18n.language;

        const mainLinks = [
                { to: "/", label: t("nav.home") },
                { to: "/search", label: t("nav.search") },
                // TODO: show student profile link only to students once role-aware menus are finalized
                { to: "/student/profile", label: t("nav.studentProfile") },
                { to: "/tutor/profile", label: t("nav.tutorProfile") },
                { to: "/chat", label: t("nav.messages") },
                // Admin link is only visible when the user role allows it; backend still enforces requireAdmin
                ...(isAdmin ? [{ to: "/admin", label: t("nav.adminDashboard") }] : []),
        ];

        const legacyLinks = [{ to: "/legacy-store", label: "Legacy Store" }];

        return (
                <header className='fixed top-0 right-0 z-50 w-full border-b border-kingdom-gold/10 bg-gradient-to-br from-kingdom-purple/95 to-kingdom-plum/95 text-kingdom-ivory shadow-royal-soft backdrop-blur-xl'>
                        <div
                                className='pointer-events-none absolute inset-0 opacity-20'
                                style={{
                                        backgroundImage: `url("data:image/svg+xml,${arabesquePattern}")`,
                                        backgroundSize: "160px",
                                        mixBlendMode: "soft-light",
                                }}
                        />
                        <div className='container relative mx-auto max-w-6xl px-4 py-3'>
                                <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                                        <Link
                                                to='/'
                                                className='flex flex-row-reverse items-center gap-3 text-kingdom-gold transition-royal focus-outline hover:text-kingdom-ivory'
                                                aria-label='الانتقال إلى ملتقى Moltaqa'
                                        >
                                                <LogoMoltaqa />
                                        </Link>

                                        <div className='flex flex-col items-center gap-3 text-sm font-medium sm:flex-row sm:justify-end sm:gap-4'>
                                                <nav className='flex flex-wrap items-center gap-3 text-kingdom-ivory/80'>
                                                        {mainLinks.map((link) => (
                                                                <Link
                                                                        key={link.to}
                                                                        to={link.to}
                                                                        className='transition-royal focus-outline hover:text-kingdom-gold'
                                                                >
                                                                        {link.label}
                                                                </Link>
                                                        ))}
                                                        <div className='flex items-center gap-2 rounded-full border border-kingdom-ivory/10 px-3 py-1 text-xs text-kingdom-ivory/70'>
                                                                <span className='uppercase tracking-wide text-kingdom-ivory/50'>Legacy</span>
                                                                {legacyLinks.map((link) => (
                                                                        <Link
                                                                                key={link.to}
                                                                                className='underline-offset-4 transition-royal hover:text-kingdom-gold'
                                                                                to={link.to}
                                                                        >
                                                                                {link.label}
                                                                        </Link>
                                                                ))}
                                                                {/* TODO: hide legacy entry points once store deprecation is finished */}
                                                        </div>
                                                        {isAdmin && (
                                                                <Link
                                                                        className='flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-kingdom-purple/40 px-4 py-2 text-kingdom-ivory transition-royal focus-outline hover:border-kingdom-gold hover:bg-kingdom-purple/70'
                                                                        to={'/secret-dashboard'}
                                                                >
                                                                        <Lock className='h-4 w-4' />
                                                                        <span className='hidden sm:inline'>{t("nav.dashboard")}</span>
                                                                </Link>
                                                        )}
                                                </nav>

                                                <div className='flex items-center gap-3'>
                                                        <div className='flex items-center gap-2 rounded-full border border-kingdom-gold/30 bg-kingdom-purple/40 px-2 py-1 text-xs font-semibold'>
                                                                {[
                                                                        { code: "ar", label: "AR" },
                                                                        { code: "fr", label: "FR" },
                                                                ].map((lang) => (
                                                                        <button
                                                                                key={lang.code}
                                                                                onClick={() => i18n.changeLanguage(lang.code)}
                                                                                className={`rounded-full px-2 py-1 transition-royal focus-outline ${
                                                                                        activeLanguage === lang.code
                                                                                                ? "bg-kingdom-gold text-kingdom-charcoal"
                                                                                                : "text-kingdom-ivory/80 hover:text-kingdom-ivory"
                                                                                }`}
                                                                                type='button'
                                                                        >
                                                                                {lang.label}
                                                                        </button>
                                                                ))}
                                                        </div>

                                                        {user ? (
                                                                <>
                                                                        <Link
                                                                                to={profileLink}
                                                                                className='flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-kingdom-purple/40 px-4 py-2 text-kingdom-ivory transition-royal focus-outline hover:bg-kingdom-purple/70'
                                                                        >
                                                                                <span className='hidden sm:inline'>
                                                                                        {user?.role === "tutor"
                                                                                                ? t("nav.tutorProfile")
                                                                                                : user?.role === "admin"
                                                                                                        ? t("nav.adminDashboard")
                                                                                                        : t("nav.studentProfile")}
                                                                                </span>
                                                                                <span className='font-semibold sm:hidden'>{user.name}</span>
                                                                        </Link>
                                                                        <button
                                                                                className='flex items-center gap-2 rounded-full border border-transparent bg-kingdom-purple/40 px-4 py-2 text-kingdom-ivory transition-royal focus-outline hover:border-kingdom-gold/40 hover:bg-kingdom-purple/70'
                                                                                onClick={logout}
                                                                        >
                                                                                <LogOut size={18} />
                                                                                <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                                        </button>
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <Link
                                                                                to={'/signup'}
                                                                                className='flex items-center gap-2 rounded-full bg-kingdom-gold px-4 py-2 font-semibold text-kingdom-charcoal transition-royal focus-outline hover:shadow-royal-glow'
                                                                        >
                                                                                <UserPlus size={18} />
                                                                                {t("nav.signup")}
                                                                        </Link>
                                                                        <Link
                                                                                to={'/login'}
                                                                                className='flex items-center gap-2 rounded-full border border-kingdom-gold/40 px-4 py-2 text-kingdom-gold transition-royal focus-outline hover:bg-kingdom-purple hover:text-white'
                                                                        >
                                                                                <LogIn size={18} />
                                                                                {t("nav.login")}
                                                                        </Link>
                                                                </>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </header>
        );
};
export default Navbar;
