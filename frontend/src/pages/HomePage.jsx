import { useEffect } from "react";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { useCategoryStore } from "../stores/useCategoryStore";
import Hero from "../components/Hero";

const HomePage = () => {
        const { fetchFeaturedProducts, products, loading: productsLoading } = useProductStore();
        const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
        const { t } = useTranslation();

        useEffect(() => {
                fetchFeaturedProducts();
        }, [fetchFeaturedProducts]);

        useEffect(() => {
                fetchCategories();
        }, [fetchCategories]);

        return (
                <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0A050D] via-kingdom-plum/95 to-[#010104] text-kingdom-cream'>
                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_transparent_55%)]' />
                        <div className='relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <Hero />

                                <motion.section
                                        id='collections'
                                        className='mt-20 rounded-[3rem] border border-white/10 bg-white/5 p-8 shadow-[0_32px_80px_-45px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-12'
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.1 }}
                                >
                                        <div className='text-center'>
                                                <h2 className='text-3xl font-semibold tracking-[0.2em] text-kingdom-gold sm:text-4xl'>
                                                        {t("home.titleLine1")}
                                                </h2>
                                                <p className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-kingdom-cream/70 sm:text-lg'>
                                                        {t("home.subtitle")}
                                                </p>
                                        </div>

                                        <div className='mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
                                                {categories.length === 0 && !categoriesLoading && (
                                                        <div className='col-span-full rounded-3xl border border-white/10 bg-black/30 p-10 text-center text-kingdom-cream/60 shadow-[0_22px_50px_-35px_rgba(0,0,0,0.7)]'>
                                                                {t("categories.manager.list.empty")}
                                                        </div>
                                                )}
                                                {categories.map((category) => (
                                                        <CategoryItem category={category} key={category._id} />
                                                ))}
                                        </div>
                                </motion.section>

                                {!productsLoading && products.length > 0 && (
                                        <div className='mt-20'>
                                                <FeaturedProducts featuredProducts={products} />
                                        </div>
                                )}
                        </div>
                </div>
        );
};
export default HomePage;
