import { useEffect, useMemo } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import ProductCard from "../components/ProductCard";
import { useCategoryStore } from "../stores/useCategoryStore";

const CategoryPage = () => {
        const { fetchProductsByCategory, products } = useProductStore();
        const { categories, fetchCategories } = useCategoryStore();
        const { category } = useParams();
        const { t } = useTranslation();

        useEffect(() => {
                fetchProductsByCategory(category);
        }, [fetchProductsByCategory, category]);

        useEffect(() => {
                if (!categories.length) {
                        fetchCategories();
                }
        }, [categories.length, fetchCategories]);

        const categoryName = useMemo(() => {
                const match = categories.find((item) => item.slug === category);
                if (match) {
                        return match.name;
                }
                const fallback = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";
                return fallback;
        }, [categories, category]);

        return (
                <div className='min-h-screen bg-kingdom-ivory'>
                        <div className='mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <motion.div
                                        className='rounded-[2.5rem] border border-kingdom-purple/15 bg-gradient-to-br from-white via-kingdom-cream/70 to-white px-6 py-12 text-center shadow-[0_28px_60px_-40px_rgba(58,31,75,0.4)] sm:px-10'
                                        initial={{ opacity: 0, y: -24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                >
                                        <motion.h1
                                                className='text-3xl font-semibold tracking-[0.2em] text-kingdom-purple sm:text-4xl'
                                                initial={{ opacity: 0, y: -12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.1 }}
                                        >
                                                {categoryName}
                                        </motion.h1>
                                        <motion.p
                                                className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-kingdom-muted'
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.2 }}
                                        >
                                                تجميعات حصرية من العطور الفاخرة المختارة بعناية لعشاق البصمة المميزة.
                                        </motion.p>
                                </motion.div>

                                <motion.div
                                        className='mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                        {products?.length === 0 && (
                                                <div className='col-span-full rounded-3xl border border-kingdom-purple/15 bg-white/90 p-12 text-center text-lg text-kingdom-muted shadow-[0_25px_40px_-30px_rgba(26,13,36,0.4)]'>
                                                        {t("categoryPage.noProducts")}
                                                </div>
                                        )}

                                        {products?.map((product) => (
                                                <ProductCard key={product._id} product={product} />
                                        ))}
                                </motion.div>
                        </div>
                </div>
        );
};
export default CategoryPage;
