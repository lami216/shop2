import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";

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
                        const width = typeof globalThis !== "undefined" ? globalThis.innerWidth : 0;
                        if (width < 640) setItemsPerPage(1);
                        else if (width < 1024) setItemsPerPage(2);
                        else if (width < 1280) setItemsPerPage(3);
                        else setItemsPerPage(4);
                };

                handleResize();
                if (typeof globalThis !== "undefined") {
                        globalThis.addEventListener("resize", handleResize);
                        return () => globalThis.removeEventListener("resize", handleResize);
                }

                return undefined;
        }, []);

        useEffect(() => {
                setCurrentIndex((previous) => Math.min(previous, Math.max(totalItems - itemsPerPage, 0)));
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

        return (
                <section className='rounded-[3rem] border border-white/10 bg-white/5 px-4 py-16 text-kingdom-cream shadow-[0_36px_80px_-48px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-8'>
                        <div className='mx-auto max-w-6xl'>
                                <div className='text-center'>
                                        <h2 className='text-3xl font-semibold tracking-[0.22em] text-kingdom-gold sm:text-4xl'>
                                                {t("home.featuredTitle")}
                                        </h2>
                                        <p className='mt-3 text-base text-kingdom-cream/70'>
                                                تشكيلة مختارة بعناية تضم روائح ملكية آسرة.
                                        </p>
                                </div>
                                <div className='relative mt-12'>
                                        <div className='overflow-hidden'>
                                                <motion.div
                                                        className='grid gap-6'
                                                        style={{
                                                                gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))`,
                                                                transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
                                                        }}
                                                        transition={{ type: "spring", stiffness: 120, damping: 24 }}
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
                                                                        <div
                                                                                key={product._id}
                                                                                className='flex w-full flex-col'
                                                                                style={{ width: `${100 / itemsPerPage}%` }}
                                                                        >
                                                                                <motion.article
                                                                                        whileHover={{ y: -10 }}
                                                                                        className='group flex h-full flex-col overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/30 shadow-[0_26px_60px_-44px_rgba(0,0,0,0.8)] backdrop-blur-lg'
                                                                                >
                                                                                        <LinkCard product={product} isDiscounted={isDiscounted} discountPercentage={discountPercentage} />
                                                                                        <div className='flex flex-1 flex-col gap-4 px-5 pb-5 pt-4 text-kingdom-cream'>
                                                                                                <ProductInfo product={product} />
                                                                                                <PriceRow
                                                                                                        price={price}
                                                                                                        discountedPrice={discountedPrice}
                                                                                                        isDiscounted={isDiscounted}
                                                                                                        onAddToCart={() => addToCart(enrichedProduct)}
                                                                                                        ctaLabel={t("common.actions.addToCart")}
                                                                                                        badge={t("home.featuredTag")}
                                                                                                />
                                                                                        </div>
                                                                                </motion.article>
                                                                        </div>
                                                                );
                                                        })}
                                                </motion.div>
                                        </div>
                                        <div className='pointer-events-none absolute inset-y-0 left-0 hidden w-full justify-between px-2 sm:flex'>
                                                <div className='pointer-events-auto flex items-center'>
                                                        <button
                                                                onClick={prevSlide}
                                                                disabled={isStartDisabled}
                                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-kingdom-cream transition hover:border-kingdom-gold/40 hover:text-kingdom-gold ${
                                                                        isStartDisabled ? "cursor-not-allowed opacity-30" : ""
                                                                }`}
                                                                aria-label={t("home.featuredPrev")}
                                                        >
                                                                <ChevronLeft className='h-5 w-5' />
                                                        </button>
                                                </div>
                                                <div className='pointer-events-auto flex items-center'>
                                                        <button
                                                                onClick={nextSlide}
                                                                disabled={isEndDisabled}
                                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-kingdom-cream transition hover:border-kingdom-gold/40 hover:text-kingdom-gold ${
                                                                        isEndDisabled ? "cursor-not-allowed opacity-30" : ""
                                                                }`}
                                                                aria-label={t("home.featuredNext")}
                                                        >
                                                                <ChevronRight className='h-5 w-5' />
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

const LinkCard = ({ product, isDiscounted, discountPercentage }) => (
        <Link
                to={`/products/${product._id}`}
                className='relative block h-56 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-kingdom-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                aria-label={product.name}
        >
                {isDiscounted && (
                        <span className='absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1 text-[0.7rem] font-semibold text-white shadow-[0_16px_35px_-30px_rgba(255,82,82,0.65)]'>
                                -{discountPercentage}%
                        </span>
                )}
                <img
                        src={product.image}
                        alt={product.name}
                        className='h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105'
                />
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050208] via-kingdom-plum/60 to-transparent opacity-90 transition duration-500 group-hover:opacity-100' />
        </Link>
);

const ProductInfo = ({ product }) => (
        <Link
                to={`/products/${product._id}`}
                className='block text-base font-semibold tracking-[0.1em] text-kingdom-cream transition hover:text-kingdom-gold'
        >
                {product.name}
        </Link>
);

const PriceRow = ({ price, discountedPrice, isDiscounted, onAddToCart, ctaLabel, badge }) => (
        <div className='mt-auto flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                <div className='flex flex-col gap-1 text-sm'>
                        {badge && <span className='text-xs uppercase tracking-[0.24em] text-kingdom-cream/50'>{badge}</span>}
                        <div className='flex items-baseline gap-2'>
                                {isDiscounted && (
                                        <span className='text-xs text-kingdom-cream/50 line-through'>{formatMRU(price)}</span>
                                )}
                                <span className='text-lg font-semibold text-kingdom-gold'>
                                        {formatMRU(discountedPrice || price)}
                                </span>
                        </div>
                </div>
                <button
                        type='button'
                        onClick={onAddToCart}
                        className='inline-flex items-center gap-2 rounded-full border border-kingdom-gold/50 bg-kingdom-gold/20 px-3 py-1.5 text-xs font-semibold text-kingdom-gold transition hover:bg-kingdom-gold/30'
                >
                        <ShoppingCart className='h-4 w-4' />
                        {ctaLabel}
                </button>
        </div>
);

export default FeaturedProducts;

const productShape = PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        images: PropTypes.arrayOf(
                PropTypes.oneOfType([
                        PropTypes.string,
                        PropTypes.shape({
                                url: PropTypes.string,
                        }),
                ])
        ),
        price: PropTypes.number,
        discountedPrice: PropTypes.number,
        discountPercentage: PropTypes.number,
        isDiscounted: PropTypes.bool,
});

FeaturedProducts.propTypes = {
        featuredProducts: PropTypes.arrayOf(productShape).isRequired,
};

LinkCard.propTypes = {
        product: productShape.isRequired,
        isDiscounted: PropTypes.bool.isRequired,
        discountPercentage: PropTypes.number.isRequired,
};

ProductInfo.propTypes = {
        product: productShape.isRequired,
};

PriceRow.propTypes = {
        price: PropTypes.number.isRequired,
        discountedPrice: PropTypes.number,
        isDiscounted: PropTypes.bool.isRequired,
        onAddToCart: PropTypes.func.isRequired,
        ctaLabel: PropTypes.string.isRequired,
        badge: PropTypes.string,
};
