import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatMRU } from "../lib/formatMRU";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import useTranslation from "../hooks/useTranslation";
import { getProductPricing } from "../lib/getProductPricing";

const resolveCoverImage = (product) => {
        if (!product) return null;

        if (product.image) {
                return product.image;
        }

        if (Array.isArray(product.images) && product.images.length > 0) {
                const [firstImage] = product.images;
                return typeof firstImage === "string" ? firstImage : firstImage?.url || null;
        }

        return null;
};

const mapGalleryImages = (product) => {
        if (!product) return [];

        if (Array.isArray(product.images) && product.images.length > 0) {
                return product.images
                        .map((image) => (typeof image === "string" ? image : image?.url))
                        .filter(Boolean);
        }

        return product.image ? [product.image] : [];
};

const ProductDetailPage = () => {
        const { id } = useParams();
        const { selectedProduct, fetchProductById, productDetailsLoading, clearSelectedProduct } = useProductStore(
                (state) => ({
                        selectedProduct: state.selectedProduct,
                        fetchProductById: state.fetchProductById,
                        productDetailsLoading: state.productDetailsLoading,
                        clearSelectedProduct: state.clearSelectedProduct,
                })
        );
        const addToCart = useCartStore((state) => state.addToCart);
        const { t } = useTranslation();
        const [activeImage, setActiveImage] = useState(null);
        const [quantity, setQuantity] = useState(1);

        useEffect(() => {
                let isMounted = true;

                fetchProductById(id)
                        .then((product) => {
                                if (isMounted) {
                                        setActiveImage(resolveCoverImage(product));
                                }
                        })
                        .catch(() => {
                                /* handled by store */
                        });

                return () => {
                        isMounted = false;
                        clearSelectedProduct();
                };
        }, [fetchProductById, id, clearSelectedProduct]);

        useEffect(() => {
                if (selectedProduct && !activeImage) {
                        setActiveImage(resolveCoverImage(selectedProduct));
                }
        }, [selectedProduct, activeImage]);

        useEffect(() => {
                if (selectedProduct) {
                        setQuantity(1);
                }
        }, [selectedProduct]);

        if (productDetailsLoading && !selectedProduct) {
                return <LoadingSpinner />;
        }

        if (!selectedProduct) {
                return (
                        <div className='relative min-h-screen bg-kingdom-ivory text-kingdom-charcoal'>
                                <div className='mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center'>
                                        <h1 className='text-3xl font-semibold tracking-[0.16em] text-kingdom-purple'>
                                                {t("products.detail.notFound.title")}
                                        </h1>
                                        <p className='mt-4 text-base leading-relaxed text-kingdom-muted'>
                                                {t("products.detail.notFound.description")}
                                        </p>
                                </div>
                        </div>
                );
        }

        const galleryImages = mapGalleryImages(selectedProduct);
        const { price, discountedPrice, isDiscounted, discountPercentage } = getProductPricing(selectedProduct);

        const handleAddToCart = async () => {
                await addToCart(
                        {
                                ...selectedProduct,
                                discountedPrice,
                                isDiscounted,
                                discountPercentage,
                        },
                        quantity
                );
                setQuantity(1);
        };

        const handleDecreaseQuantity = () => {
                setQuantity((prev) => Math.max(1, prev - 1));
        };

        const handleIncreaseQuantity = () => {
                setQuantity((prev) => prev + 1);
        };

        return (
                <div className='relative min-h-screen overflow-hidden bg-kingdom-ivory text-kingdom-charcoal'>
                        <div className='mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <div className='grid gap-14 lg:grid-cols-2 lg:items-start'>
                                        <div className='space-y-6'>
                                                <div className='relative flex h-[28rem] items-center justify-center overflow-hidden rounded-[2rem] border border-kingdom-purple/15 bg-white shadow-[0_28px_50px_-32px_rgba(26,13,36,0.6)]'>
                                                        {activeImage ? (
                                                                <img src={activeImage} alt={selectedProduct.name} className='h-full w-full object-contain' />
                                                        ) : (
                                                                <div className='text-kingdom-muted'>{t("common.status.noImage")}</div>
                                                        )}
                                                </div>
                                                {galleryImages.length > 1 && (
                                                        <div className='mt-4 flex gap-3 overflow-x-auto pb-2'>
                                                                {galleryImages.map((imageUrl, index) => {
                                                                        const isActive = imageUrl === activeImage;
                                                                        const localizedIndex = new Intl.NumberFormat("ar").format(index + 1);
                                                                        return (
                                                                                <button
                                                                                        key={`${imageUrl}-${index}`}
                                                                                        type='button'
                                                                                        onClick={() => setActiveImage(imageUrl)}
                                                                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition-royal focus-outline ${
                                                                                                isActive ? "border-kingdom-gold" : "border-transparent"
                                                                                        }`}
                                                                                        aria-label={t("products.detail.viewImage", { index: localizedIndex })}
                                                                                >
                                                                                        <img src={imageUrl} alt='' className='h-full w-full object-cover' />
                                                                                </button>
                                                                        );
                                                                })}
                                                        </div>
                                                )}
                                        </div>

                                        <div className='flex flex-col gap-8 rounded-[2rem] border border-kingdom-purple/10 bg-white/80 p-8 shadow-[0_24px_60px_-40px_rgba(34,18,40,0.45)] backdrop-blur-sm lg:sticky lg:top-28'>
                                                <div className='space-y-6'>
                                                        {selectedProduct.category && (
                                                                <p className='text-sm font-medium uppercase tracking-[0.3em] text-kingdom-purple/70'>
                                                                        {selectedProduct.category}
                                                                </p>
                                                        )}
                                                        <div className='space-y-2'>
                                                                <p className='text-sm font-medium text-kingdom-muted'>الإسم</p>
                                                                <h1 className='text-3xl font-semibold tracking-[0.1em] text-kingdom-purple'>
                                                                        {selectedProduct.name}
                                                                </h1>
                                                        </div>
                                                        <div className='space-y-3'>
                                                                <p className='text-sm font-medium text-kingdom-muted'>السعر</p>
                                                                <div className='flex flex-wrap items-center gap-4 text-3xl font-semibold text-kingdom-purple'>
                                                                        {isDiscounted ? (
                                                                                <>
                                                                                        <span className='text-2xl font-normal text-kingdom-muted line-through'>
                                                                                                {formatMRU(price)}
                                                                                        </span>
                                                                                        <span className='text-4xl font-bold text-kingdom-purple'>
                                                                                                {formatMRU(discountedPrice)}
                                                                                        </span>
                                                                                        <span className='rounded-full bg-kingdom-purple/90 px-4 py-1 text-base font-semibold text-kingdom-ivory shadow-[0_12px_24px_-18px_rgba(26,13,36,0.7)]'>
                                                                                                -{discountPercentage}%
                                                                                        </span>
                                                                                </>
                                                                        ) : (
                                                                                <span>{formatMRU(price)}</span>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>

                                                <div className='flex flex-wrap items-center gap-3 text-sm text-kingdom-muted'>
                                                        <span className='font-medium text-kingdom-purple'>
                                                                {t("cart.item.chooseQuantity")}
                                                        </span>
                                                        <div className='flex items-center gap-3'>
                                                                <button
                                                                        type='button'
                                                                        onClick={handleDecreaseQuantity}
                                                                        className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-kingdom-purple/20 bg-white text-kingdom-purple transition-royal focus-outline hover:border-kingdom-gold hover:text-kingdom-plum'
                                                                        aria-label={t("cart.item.decrease")}
                                                                >
                                                                        <Minus className='h-4 w-4' />
                                                                </button>
                                                                <span className='flex h-10 min-w-[3rem] items-center justify-center rounded-xl border border-kingdom-purple/15 bg-white/80 text-base font-semibold text-kingdom-purple'>
                                                                        {quantity}
                                                                </span>
                                                                <button
                                                                        type='button'
                                                                        onClick={handleIncreaseQuantity}
                                                                        className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-kingdom-purple/20 bg-white text-kingdom-purple transition-royal focus-outline hover:border-kingdom-gold hover:text-kingdom-plum'
                                                                        aria-label={t("cart.item.increase")}
                                                                >
                                                                        <Plus className='h-4 w-4' />
                                                                </button>
                                                        </div>
                                                </div>

                                                <div className='space-y-3 text-base text-kingdom-muted'>
                                                        <h2 className='text-lg font-semibold text-kingdom-purple'>
                                                                {t("products.detail.descriptionTitle")}
                                                        </h2>
                                                        <p className='leading-relaxed'>
                                                                {selectedProduct.description || t("products.detail.descriptionFallback")}
                                                        </p>
                                                </div>

                                                <button
                                                        onClick={handleAddToCart}
                                                        className='inline-flex items-center justify-center gap-2 rounded-full bg-kingdom-gold px-7 py-3 text-lg font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow'
                                                >
                                                        {t("common.actions.addToCart")}
                                                </button>
                                        </div>
                                </div>
                        </div>

                        <div className='mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8'>
                                <PeopleAlsoBought productId={selectedProduct._id} category={selectedProduct.category} />
                        </div>
                </div>
        );
};

export default ProductDetailPage;
