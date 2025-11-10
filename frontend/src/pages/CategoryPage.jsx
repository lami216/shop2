import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useTranslation from "../hooks/useTranslation";
import ProductCard from "../components/ProductCard";
import { useCategoryStore } from "../stores/useCategoryStore";
import SiteSearchBar from "../components/SiteSearchBar";
import useDebounce from "../hooks/useDebounce";

const CategoryPage = () => {
        const {
                fetchProductsByCategory,
                products,
                loading,
                error,
                searchProducts,
                searchResults,
                searchLoading,
                searchError,
                clearSearchResults,
        } = useProductStore();
        const { categories, fetchCategories } = useCategoryStore();
        const { category } = useParams();
        const { t } = useTranslation();
        const [searchTerm, setSearchTerm] = useState("");

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

        const debouncedSearchTerm = useDebounce(searchTerm, 250);
        const normalizedSearchTerm = debouncedSearchTerm.trim();
        const shouldSearchRemotely = normalizedSearchTerm.length > 0;

        useEffect(() => {
                if (!shouldSearchRemotely) {
                        clearSearchResults();
                        return;
                }

                searchProducts({ query: normalizedSearchTerm, category });
        }, [shouldSearchRemotely, normalizedSearchTerm, category, searchProducts, clearSearchResults]);

        useEffect(() => clearSearchResults, [clearSearchResults]);

        const locallyFilteredProducts = useMemo(() => {
                if (!searchTerm.trim()) return products;
                const normalized = searchTerm.trim().toLowerCase();
                return products.filter((product) =>
                        [product.name, product.description]
                                .filter(Boolean)
                                .some((field) => field.toLowerCase().includes(normalized))
                );
        }, [products, searchTerm]);

        const filteredProducts = shouldSearchRemotely ? searchResults : locallyFilteredProducts;
        const activeError = searchError || error;

        return (
                <div className='min-h-screen bg-gradient-to-br from-[#0A050D] via-kingdom-plum/95 to-[#010104] text-kingdom-cream'>
                        <div className='mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <motion.div
                                        className='rounded-[3rem] border border-white/10 bg-white/5 px-6 py-12 text-center shadow-[0_32px_80px_-48px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-12'
                                        initial={{ opacity: 0, y: -24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                >
                                        <motion.h1
                                                className='text-3xl font-semibold tracking-[0.22em] text-kingdom-gold sm:text-4xl'
                                                initial={{ opacity: 0, y: -12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.1 }}
                                        >
                                                {categoryName}
                                        </motion.h1>
                                        <motion.p
                                                className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-kingdom-cream/70'
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.2 }}
                                        >
                                                تجميعات حصرية من العطور الفاخرة المختارة بعناية لعشاق البصمة المميزة.
                                        </motion.p>
                                        <div className='mt-10'>
                                                <SiteSearchBar
                                                        value={searchTerm}
                                                        onChange={setSearchTerm}
                                                        placeholder={t("categoryPage.searchPlaceholder", { category: categoryName })}
                                                        className='px-0'
                                                        onSubmit={() => {}}
                                                >
                                                        <span className='text-xs uppercase tracking-[0.24em] text-kingdom-cream/60'>
                                                                {t("categoryPage.searchTag")}
                                                        </span>
                                                        <span className='text-sm text-kingdom-gold'>
                                                                {t("categoryPage.resultsCount", { count: filteredProducts.length })}
                                                        </span>
                                                </SiteSearchBar>
                                        </div>
                                </motion.div>

                                <motion.div
                                        className='mt-16'
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
                                                <AnimatePresence mode='wait'>
                                                        {(loading || searchLoading) && (
                                                                <motion.div
                                                                        key='loading'
                                                                        className='col-span-full grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                >
                                                                        {Array.from({ length: 6 }).map((_, index) => (
                                                                                <SkeletonCard key={index} />
                                                                        ))}
                                                                </motion.div>
                                                        )}
                                                        {!loading && !searchLoading && activeError && (
                                                                <motion.div
                                                                        key='error'
                                                                        className='col-span-full rounded-[2.5rem] border border-red-400/40 bg-red-500/10 p-10 text-center text-sm text-red-200'
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -10 }}
                                                                >
                                                                        {activeError}
                                                                </motion.div>
                                                        )}
                                                        {!loading && !searchLoading && !activeError && filteredProducts.length === 0 && (
                                                                <motion.div
                                                                        key='empty'
                                                                        className='col-span-full rounded-[2.5rem] border border-white/10 bg-black/30 p-12 text-center text-lg text-kingdom-cream/60 shadow-[0_28px_60px_-48px_rgba(0,0,0,0.8)]'
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -10 }}
                                                                >
                                                                        {shouldSearchRemotely
                                                                                ? t("categoryPage.noSearchResults")
                                                                                : t("categoryPage.noProducts")}
                                                                </motion.div>
                                                        )}
                                                        {!loading && !searchLoading && !activeError &&
                                                                filteredProducts.map((product) => (
                                                                <motion.div
                                                                        key={product._id}
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -20 }}
                                                                        transition={{ duration: 0.4 }}
                                                                >
                                                                        <ProductCard product={product} />
                                                                </motion.div>
                                                        ))}
                                                </AnimatePresence>
                                        </div>
                                </motion.div>
                        </div>
                </div>
        );
};
export default CategoryPage;

const SkeletonCard = () => (
        <motion.div
                className='h-full rounded-[2.5rem] border border-white/5 bg-white/5 p-6 shadow-[0_24px_50px_-45px_rgba(0,0,0,0.8)] backdrop-blur-lg'
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
        >
                <div className='mb-4 h-48 rounded-[1.75rem] bg-white/10' />
                <div className='mb-2 h-5 rounded-full bg-white/10' />
                <div className='mb-4 h-4 rounded-full bg-white/10' />
                <div className='h-10 rounded-full bg-white/10' />
        </motion.div>
);
