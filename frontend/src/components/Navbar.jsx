import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

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
        const { cart } = useCartStore();
        const cartItemCount = cart.reduce((total, item) => total + (item.quantity ?? 0), 0);
        const { t } = useTranslation();

        const cartLink = (
                <Link
                        to={'/cart'}
                        className='relative group flex items-center gap-2 rounded-full border border-kingdom-gold/40 bg-kingdom-purple/30 px-4 py-2 text-sm font-semibold text-kingdom-ivory transition-royal focus-outline hover:border-kingdom-gold hover:bg-kingdom-purple/60'
                >
                        <ShoppingCart size={18} className='transition-royal group-hover:text-kingdom-gold' />
                        <span className='hidden sm:inline'>{t("nav.cart")}</span>
                        {cartItemCount > 0 && (
                                <span className='absolute -top-2 -right-2 rounded-full bg-kingdom-gold px-2 py-0.5 text-xs font-semibold text-kingdom-charcoal shadow-[0_4px_10px_rgba(212,175,55,0.35)] transition-royal group-hover:shadow-royal-glow'>
                                        {cartItemCount}
                                </span>
                        )}
                </Link>
        );

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
                                        >
                                                <span className='text-2xl font-semibold tracking-[0.22em]'>مملكة العطور</span>
                                                <span className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/40 bg-kingdom-purple/40 backdrop-blur-sm'>
                                                                <svg
                                                                        xmlns='http://www.w3.org/2000/svg'
                                                                        viewBox='0 0 64 64'
                                                                        className='h-7 w-7'
                                                                        fill='none'
                                                                        stroke='currentColor'
                                                                        strokeWidth='1.8'
                                                                        strokeLinecap='round'
                                                                        strokeLinejoin='round'
                                                                >
                                                                        <circle cx='32' cy='32' r='22.5' opacity='0.6' />
                                                                        <path d='M20 30c6-2 9-7 12-12 3 5 6 10 12 12-3 2-4 6-4 10h-16c0-4-1-8-4-10z' opacity='0.7' />
                                                                        <path d='M26 40h12' />
                                                                        <path d='M24 24l-2-5 10-5 10 5-2 5' />
                                                                        <path d='M28 46h8l-2 6h-4z' opacity='0.7' />
                                                                </svg>
                                                </span>
                                        </Link>

                                        <div className='flex flex-col items-center gap-3 text-sm font-medium sm:flex-row sm:justify-end sm:gap-4'>
                                                <nav className='flex items-center gap-4 text-kingdom-ivory/80'>
                                                        <Link
                                                                to={'/'}
                                                                className='transition-royal focus-outline hover:text-kingdom-gold'
                                                        >
                                                                {t("nav.home")}
                                                        </Link>
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
                                                        {cartLink}
                                                        {user ? (
                                                                <button
                                                                        className='flex items-center gap-2 rounded-full border border-transparent bg-kingdom-purple/40 px-4 py-2 text-kingdom-ivory transition-royal focus-outline hover:border-kingdom-gold/40 hover:bg-kingdom-purple/70'
                                                                        onClick={logout}
                                                                >
                                                                        <LogOut size={18} />
                                                                        <span className='hidden sm:inline'>{t("nav.logout")}</span>
                                                                </button>
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
