import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";
import { getReadableTextColor } from "../lib/colorUtils";

const ProductCard = ({ product }) => {
        const { addToCart } = useCartStore();
        const { t } = useTranslation();
        const { price, discountedPrice, isDiscounted, discountPercentage } = getProductPricing(product);
        const productForCart = {
                ...product,
                discountedPrice,
                isDiscounted,
                discountPercentage,
        };
        const coverImage =
                product.image ||
                (Array.isArray(product.images) && product.images.length > 0
                        ? typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0]?.url
                        : "");

        const handleAddToCart = () => {
                addToCart(productForCart);
        };

        const cardBackground = "#FFFFFF";
        const titleColor = getReadableTextColor(cardBackground);

        return (
                <article className='group relative flex w-full flex-col overflow-hidden rounded-2xl border border-kingdom-purple/12 bg-white shadow-[0_22px_40px_-30px_rgba(26,13,36,0.65)] transition-royal hover:-translate-y-1.5 hover:shadow-royal-soft'>
                        <Link
                                to={`/products/${product._id}`}
                                className='relative block w-full overflow-hidden aspect-[4/5] focus-outline'
                                aria-label={t("product.viewDetails", { name: product.name })}
                        >
                                {isDiscounted && (
                                        <span className='absolute right-4 top-4 z-10 rounded-full bg-kingdom-purple/95 px-3 py-1 text-xs font-semibold text-kingdom-ivory shadow-[0_12px_25px_-20px_rgba(34,18,40,0.65)]'>
                                                -{discountPercentage}%
                                        </span>
                                )}
                                {coverImage ? (
                                        <img
                                                className='h-full w-full object-cover transition-royal group-hover:scale-105'
                                                src={coverImage}
                                                alt={product.name}
                                        />
                                ) : (
                                        <div className='flex h-full w-full items-center justify-center bg-kingdom-purple/40 text-sm text-kingdom-ivory/80'>
                                                {t("common.status.noImage")}
                                        </div>
                                )}
                                <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-kingdom-plum/75 via-kingdom-purple/25 to-transparent opacity-60 transition-royal group-hover:opacity-80' />
                        </Link>

                        <div className='flex flex-1 flex-col gap-4 px-6 pb-6 pt-5'>
                                <Link
                                        to={`/products/${product._id}`}
                                        className='block transition-royal hover:text-kingdom-purple'
                                >
                                        <h5 className='text-lg font-semibold tracking-[0.08em]' style={{ color: titleColor }}>
                                                {product.name}
                                        </h5>
                                </Link>
                                <p className='text-sm leading-relaxed text-kingdom-muted'>
                                        {product.description}
                                </p>
                                <div className='mt-auto flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-kingdom-purple to-kingdom-plum px-4 py-3 text-kingdom-ivory shadow-[0_18px_30px_-22px_rgba(26,13,36,0.7)]'>
                                        <div className='text-sm'>
                                                {isDiscounted ? (
                                                        <div className='flex flex-col items-start gap-1'>
                                                                <span className='text-xs text-kingdom-ivory/70 line-through'>
                                                                        {formatMRU(price)}
                                                                </span>
                                                                <span className='text-lg font-semibold'>
                                                                        {formatMRU(discountedPrice)}
                                                                </span>
                                                        </div>
                                                ) : (
                                                        <span className='text-lg font-semibold'>{formatMRU(price)}</span>
                                                )}
                                        </div>
                                        <button
                                                className='inline-flex items-center justify-center gap-2 rounded-full bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow'
                                                onClick={handleAddToCart}
                                        >
                                                <ShoppingCart size={18} />
                                                {t("common.actions.addToCart")}
                                        </button>
                                </div>
                        </div>
                </article>
        );
};
export default ProductCard;
