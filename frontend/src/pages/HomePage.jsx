import { useEffect } from "react";
import useTranslation from "../hooks/useTranslation";

const HomePage = () => {
        const { t, i18n } = useTranslation();

        useEffect(() => {
                document.title = t("page.home.title") || "Moltaqa";
        }, [i18n.language, t]);

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <h1 className='text-4xl font-bold text-kingdom-gold'>{t("home.heading")}</h1>
                                <p className='text-lg text-kingdom-cream/80'>{t("home.subtitle")}</p>
                                <p className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-6 text-kingdom-cream/80 shadow-royal-soft'>
                                        {t("home.placeholderCard")}
                                        {/* TODO: add hero and discovery sections after domain flows stabilize */}
                                </p>
                        </div>
                </div>
        );
};

export default HomePage;
