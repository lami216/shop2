import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { getProductPricing } from "../lib/getProductPricing";

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

        return (
                <motion.article
                        whileHover={{ y: -12 }}
                        className='group relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 shadow-[0_28px_65px_-45px_rgba(0,0,0,0.8)] backdrop-blur-lg'
                >
                        <Link
                                to={`/products/${product._id}`}
                                className='relative block w-full overflow-hidden aspect-[4/5] focus:outline-none focus-visible:ring-2 focus-visible:ring-kingdom-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                                aria-label={t("product.viewDetails", { name: product.name })}
                        >
                                {isDiscounted && (
                                        <span className='absolute right-5 top-5 z-10 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white shadow-[0_18px_35px_-28px_rgba(255,82,82,0.65)]'>
                                                -{discountPercentage}%
                                        </span>
                                )}
                                {coverImage ? (
                                        <img
                                                className='h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105'
                                                src={coverImage}
                                                alt={product.name}
                                        />
                                ) : (
                                        <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-kingdom-plum via-kingdom-purple to-[#0E0712] text-sm text-kingdom-cream/70'>
                                                {t("common.status.noImage")}
                                        </div>
                                )}
                                <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050208] via-kingdom-plum/60 to-transparent opacity-90 transition duration-500 group-hover:opacity-100' />
                        </Link>

                        <div className='flex flex-1 flex-col gap-4 px-6 pb-6 pt-5 text-kingdom-cream'>
                                <Link
                                        to={`/products/${product._id}`}
                                        className='block transition hover:text-kingdom-gold'
                                >
                                        <h5 className='text-lg font-semibold tracking-[0.12em]'>
                                                {product.name}
                                        </h5>
                                </Link>
                                <p className='line-clamp-3 text-sm leading-relaxed text-kingdom-cream/70'>
                                        {product.description}
                                </p>
                                <div className='mt-auto rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_45px_-38px_rgba(0,0,0,0.8)]'>
                                        <div className='flex items-end justify-between gap-3'>
                                                <div className='flex flex-col gap-1 text-sm'>
                                                        {isDiscounted && (
                                                                <span className='text-xs text-kingdom-cream/50 line-through'>
                                                                        {formatMRU(price)}
                                                                </span>
                                                        )}
                                                        <span className='text-xl font-semibold text-kingdom-gold'>
                                                                {formatMRU(discountedPrice || price)}
                                                        </span>
                                                </div>
                                                <button
                                                        type='button'
                                                        className='inline-flex items-center gap-2 rounded-full border border-kingdom-gold/50 bg-kingdom-gold/20 px-4 py-2 text-sm font-semibold text-kingdom-gold transition hover:bg-kingdom-gold/30'
                                                        onClick={handleAddToCart}
                                                >
                                                        <ShoppingCart size={18} />
                                                        {t("common.actions.addToCart")}
                                                </button>
                                        </div>
                                </div>
                        </div>
                </motion.article>
        );
};
export default ProductCard;

ProductCard.propTypes = {
        product: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                description: PropTypes.string,
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
        }).isRequired,
};
