import { useEffect } from "react";
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
                <div className='relative min-h-screen overflow-hidden'>
                        <div className='relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8'>
                                <Hero />

                                <div className='relative mt-16 overflow-hidden rounded-[3rem] border border-kingdom-purple/10 bg-white/50 shadow-royal-soft/40 backdrop-blur-sm'>
                                        <div className='pointer-events-none absolute inset-0 -z-10'>
                                                <div className='absolute inset-0 bg-[url("/perfumes.png")] bg-cover bg-center opacity-35' />
                                                <div className='absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/70' />
                                        </div>
                                        <div className='relative space-y-14 px-6 py-12 sm:px-10 lg:px-14'>
                                                <section id='collections' className='space-y-10'>
                                                        <div className='text-center'>
                                                                <h2 className='text-3xl font-semibold tracking-[0.18em] text-kingdom-purple sm:text-4xl'>
                                                                        {t("home.titleLine1")}
                                                                </h2>
                                                                <p className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-kingdom-muted sm:text-lg'>
                                                                        {t("home.subtitle")}
                                                                </p>
                                                        </div>

                                                        <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
                                                                {categories.length === 0 && !categoriesLoading && (
                                                                        <div className='col-span-full rounded-3xl border border-kingdom-purple/15 bg-white/85 p-10 text-center text-kingdom-muted shadow-royal-soft/40'>
                                                                                {t("categories.manager.list.empty")}
                                                                        </div>
                                                                )}
                                                                {categories.map((category) => (
                                                                        <CategoryItem category={category} key={category._id} />
                                                                ))}
                                                        </div>
                                                </section>

                                                {!productsLoading && products.length > 0 && (
                                                        <FeaturedProducts featuredProducts={products} />
                                                )}
                                        </div>
                                </div>
                        </div>
                </div>
        );
};
export default HomePage;
