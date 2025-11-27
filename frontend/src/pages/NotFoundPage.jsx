import { useEffect } from "react";
import { Link } from "react-router-dom";

import useTranslation from "../hooks/useTranslation";

const NotFoundPage = () => {
        const { t, i18n } = useTranslation();

        useEffect(() => {
                        document.title = t("page.notFound.title") || "Page not found";
        }, [i18n.language, t]);

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 pb-24 pt-24 text-center sm:px-6 lg:px-8'>
                                <h1 className='text-4xl font-bold text-kingdom-gold'>{t("page.notFound.heading") || "Page not found"}</h1>
                                <p className='text-kingdom-cream/70'>
                                        {t("page.notFound.copy") || "The page you are looking for does not exist or may have moved."}
                                </p>
                                <div className='flex flex-wrap items-center justify-center gap-3'>
                                        <Link
                                                to='/'
                                                className='rounded-full bg-kingdom-gold px-5 py-2 font-semibold text-kingdom-charcoal transition hover:bg-amber-300'
                                        >
                                                {t("nav.home")}
                                        </Link>
                                        <Link
                                                to='/search'
                                                className='rounded-full border border-kingdom-gold/40 px-5 py-2 font-semibold text-kingdom-ivory transition hover:border-kingdom-gold'
                                        >
                                                {t("nav.search")}
                                        </Link>
                                </div>
                                {/* TODO: replace with illustration once brand assets are finalized */}
                        </div>
                </div>
        );
};

export default NotFoundPage;
