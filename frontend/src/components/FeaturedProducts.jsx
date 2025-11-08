import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";
import { getReadableTextColor } from "../lib/colorUtils";

const FeaturedProducts = ({ featuredProducts }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [itemsPerPage, setItemsPerPage] = useState(4);

        const { addToCart } = useCartStore();
        const { t } = useTranslation();

        const products = useMemo(
                () => (Array.isArray(featuredProducts) ? featuredProducts : []),
                [featuredProducts]
        );
        const totalItems = products.length;

        useEffect(() => {
                const handleResize = () => {
                        if (window.innerWidth < 640) setItemsPerPage(1);
                        else if (window.innerWidth < 1024) setItemsPerPage(2);
                        else if (window.innerWidth < 1280) setItemsPerPage(3);
                        else setItemsPerPage(4);
                };

                handleResize();
                window.addEventListener("resize", handleResize);
                return () => window.removeEventListener("resize", handleResize);
        }, []);

        useEffect(() => {
                setCurrentIndex((previous) =>
                        Math.min(previous, Math.max(totalItems - itemsPerPage, 0))
                );
        }, [totalItems, itemsPerPage]);

        const nextSlide = () => {
                setCurrentIndex((prevIndex) =>
                        Math.min(prevIndex + itemsPerPage, Math.max(totalItems - itemsPerPage, 0))
                );
        };

        const prevSlide = () => {
                setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
        };

        const isStartDisabled = currentIndex === 0;
        const isEndDisabled = currentIndex >= Math.max(totalItems - itemsPerPage, 0);

        const cardBackground = "#FFFFFF";
        const adaptiveText = getReadableTextColor(cardBackground);

        return (
                <section className='rounded-[2.25rem] border border-kingdom-purple/10 bg-gradient-to-br from-white/90 via-kingdom-ivory to-kingdom-cream/80 px-4 py-16 shadow-[0_30px_60px_-36px_rgba(58,31,75,0.45)] sm:px-8'>
                        <div className='mx-auto max-w-6xl'>
                                <div className='text-center'>
                                        <h2 className='text-3xl font-semibold tracking-[0.2em] text-kingdom-purple sm:text-4xl'>
                                                {t("home.featuredTitle")}
                                        </h2>
                                        <p className='mt-3 text-base text-kingdom-muted'>
                                                تشكيلة مختارة بعناية تضم روائح ملكية آسرة.
                                        </p>
                                </div>
                                <div className='relative mt-12'>
                                        <div className='overflow-hidden pb-6'>
                                                <div
                                                        className='flex gap-5 transition-transform duration-220 ease-out'
                                                        style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                                                >
                                                        {products.map((product) => {
                                                                const { price, discountedPrice, isDiscounted, discountPercentage } =
                                                                        getProductPricing(product);
                                                                const enrichedProduct = {
                                                                        ...product,
                                                                        discountedPrice,
                                                                        isDiscounted,
                                                                        discountPercentage,
                                                                };

                                                                return (
                                                                        <div key={product._id} className='w-full flex-shrink-0 sm:w-1/2 lg:w-1/3 xl:w-1/4'>
                                                                                <article className='group flex h-full flex-col overflow-hidden rounded-3xl border border-kingdom-purple/10 bg-white shadow-[0_25px_45px_-28px_rgba(26,13,36,0.5)] transition-royal hover:-translate-y-1.5 hover:shadow-royal-soft'>
                                                                                        <div className='relative h-52 overflow-hidden'>
                                                                                                {isDiscounted && (
                                                                                                        <span className='absolute right-4 top-4 z-10 rounded-full bg-kingdom-purple/95 px-3 py-1 text-xs font-semibold text-kingdom-ivory shadow-[0_10px_25px_-18px_rgba(34,18,40,0.65)]'>
                                                                                                                -{discountPercentage}%
                                                                                                        </span>
                                                                                                )}
                                                                                                <img
                                                                                                        src={product.image}
                                                                                                        alt={product.name}
                                                                                                        className='h-full w-full object-cover transition-royal group-hover:scale-105'
                                                                                                />
                                                                                                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-kingdom-purple/15 to-kingdom-purple/60 opacity-0 transition-royal group-hover:opacity-100' />
                                                                                        </div>
                                                                                        <div className='flex flex-1 flex-col gap-4 px-6 py-6'>
                                                                                                <h3 className='text-lg font-semibold tracking-[0.08em]' style={{ color: adaptiveText }}>
                                                                                                        {product.name}
                                                                                                </h3>
                                                                                                <div className='flex flex-wrap items-baseline gap-3 text-sm font-medium'>
                                                                                                        {isDiscounted ? (
                                                                                                                <>
                                                                                                                        <span className='text-kingdom-muted line-through'>{formatMRU(price)}</span>
                                                                                                                        <span className='text-lg font-semibold text-kingdom-purple'>{formatMRU(discountedPrice)}</span>
                                                                                                                </>
                                                                                                        ) : (
                                                                                                                <span className='text-lg font-semibold text-kingdom-purple'>
                                                                                                                        {formatMRU(price)}
                                                                                                                </span>
                                                                                                        )}
                                                                                                </div>
                                                                                                <div className='mt-auto flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-kingdom-purple to-kingdom-plum px-4 py-3 text-kingdom-ivory shadow-[0_18px_28px_-20px_rgba(26,13,36,0.7)]'>
                                                                                                        <div className='text-sm'>
                                                                                                                <span className='block text-xs text-kingdom-ivory/70'>سعر اليوم</span>
                                                                                                                <span className='text-base font-semibold'>{formatMRU(discountedPrice || price)}</span>
                                                                                                        </div>
                                                                                                        <button
                                                                                                                onClick={() => addToCart(enrichedProduct)}
                                                                                                                className='inline-flex items-center justify-center gap-2 rounded-full bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow'
                                                                                                        >
                                                                                                                <ShoppingCart className='h-4 w-4' />
                                                                                                                {t("common.actions.addToCart")}
                                                                                                        </button>
                                                                                                </div>
                                                                                        </div>
                                                                                </article>
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </div>
                                        <div className='absolute inset-y-1/2 hidden -translate-y-1/2 items-center justify-between px-2 sm:flex'>
                                                <button
                                                        onClick={nextSlide}
                                                        disabled={isEndDisabled}
                                                        className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-kingdom-gold/30 bg-white/80 text-kingdom-purple shadow-[0_15px_30px_-25px_rgba(34,18,40,0.75)] transition-royal focus-outline hover:border-kingdom-gold hover:text-kingdom-plum ${
                                                                isEndDisabled ? "cursor-not-allowed opacity-40" : ""
                                                        }`}
                                                        aria-label={t("home.featuredNext")}
                                                >
                                                        <ChevronRight className='h-5 w-5' />
                                                </button>
                                                <button
                                                        onClick={prevSlide}
                                                        disabled={isStartDisabled}
                                                        className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-kingdom-gold/30 bg-white/80 text-kingdom-purple shadow-[0_15px_30px_-25px_rgba(34,18,40,0.75)] transition-royal focus-outline hover:border-kingdom-gold hover:text-kingdom-plum ${
                                                                isStartDisabled ? "cursor-not-allowed opacity-40" : ""
                                                        }`}
                                                        aria-label={t("home.featuredPrev")}
                                                >
                                                        <ChevronLeft className='h-5 w-5' />
                                                </button>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};
export default FeaturedProducts;
