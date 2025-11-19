import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import { useCartStore } from "../stores/useCartStore";
import { formatMRU } from "../lib/formatMRU";
import { formatNumberEn } from "../lib/formatNumberEn";
import { getProductPricing } from "../lib/getProductPricing";

const CheckoutPage = () => {
        const { cart, total, subtotal, coupon, isCouponApplied, clearCart } = useCartStore();
        const navigate = useNavigate();
        const [customerName, setCustomerName] = useState("");
        const [whatsAppNumber, setWhatsAppNumber] = useState("");
        const [address, setAddress] = useState("");
        const [whatsAppError, setWhatsAppError] = useState("");
        const { t } = useTranslation();

        useEffect(() => {
                const hasPendingWhatsAppRedirect = sessionStorage.getItem("whatsappOrderSent");

                if (cart.length === 0 && !hasPendingWhatsAppRedirect) {
                        toast.error(t("common.messages.cartEmptyToast"));
                        navigate("/cart", { replace: true });
                }
        }, [cart, navigate, t]);

        useEffect(() => {
                const shouldRedirect = sessionStorage.getItem("whatsappOrderSent");

                if (shouldRedirect) {
                        sessionStorage.removeItem("whatsappOrderSent");
                        navigate("/purchase-success", { replace: true });
                }
        }, [navigate]);

        const normalizedWhatsAppNumber = whatsAppNumber.replace(/\D/g, "");
        const isWhatsAppValid = /^\d{8}$/.test(normalizedWhatsAppNumber);
        const isFormValid = customerName.trim() !== "" && address.trim() !== "" && cart.length > 0 && isWhatsAppValid;

        const handleWhatsAppChange = (event) => {
                const value = event.target.value;
                setWhatsAppNumber(value);

                const digitsOnly = value.replace(/\D/g, "");

                if (value.trim() === "") {
                        setWhatsAppError("");
                        return;
                }

                if (!/^\d{8}$/.test(digitsOnly)) {
                        setWhatsAppError(t("common.messages.whatsAppInvalid"));
                } else {
                        setWhatsAppError("");
                }
        };

        const productsSummary = useMemo(
                () =>
                        cart.map((item, index) => {
                                const { discountedPrice } = getProductPricing(item);
                                const lineTotal = discountedPrice * item.quantity;
                                const productIndex = formatNumberEn(index + 1);
                                const quantity = formatNumberEn(item.quantity);
                                return `${productIndex}. ${item.name} × ${quantity} = ${formatMRU(lineTotal)}`;
                        }),
                [cart]
        );

        const savings = Math.max(subtotal - total, 0);

        const handleSubmit = async (event) => {
                event.preventDefault();

                if (!customerName.trim() || !whatsAppNumber.trim() || !address.trim()) {
                        toast.error(t("common.messages.fillAllFields"));
                        return;
                }

                if (!/^\d{8}$/.test(normalizedWhatsAppNumber)) {
                        setWhatsAppError(t("common.messages.whatsAppInvalid"));
                        toast.error(t("common.messages.whatsAppInvalid"));
                        return;
                }

                if (cart.length === 0) {
                        toast.error(t("common.messages.cartEmpty"));
                        navigate("/cart");
                        return;
                }

                const displayCustomerNumber = normalizedWhatsAppNumber || whatsAppNumber;

                const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
                const orderDetailsPayload = {
                        customerName: customerName.trim(),
                        phone: displayCustomerNumber,
                        address: address.trim(),
                        items: cart.map((item) => {
                                const { price, discountedPrice, discountPercentage, isDiscounted } =
                                        getProductPricing(item);
                                return {
                                        id: item._id,
                                        name: item.name,
                                        description: item.description,
                                        image: item.image,
                                        price: discountedPrice,
                                        originalPrice: price,
                                        discountPercentage,
                                        isDiscounted,
                                        quantity: item.quantity,
                                };
                        }),
                        summary: {
                                subtotal,
                                total,
                                totalQuantity,
                        },
                };

                sessionStorage.setItem("lastOrderDetails", JSON.stringify(orderDetailsPayload));

                const discountPercentage = coupon && isCouponApplied ? formatNumberEn(coupon.discountPercentage) : null;

                const messageLines = [
                        t("checkout.messages.newOrder", { name: customerName }),
                        t("checkout.messages.customerWhatsApp", { number: displayCustomerNumber }),
                        t("checkout.messages.address", { address }),
                        "",
                        t("checkout.messages.productsHeader"),
                        ...productsSummary,
                        ...(productsSummary.length === 0
                                ? [t("checkout.messages.noProducts")]
                                : []),
                        ...(discountPercentage
                                ? [
                                          "",
                                          t("checkout.messages.coupon", {
                                                  code: coupon.code,
                                                  discount: discountPercentage,
                                          }),
                                  ]
                                : []),
                        ...(savings > 0
                                ? ["", t("checkout.messages.savings", { amount: formatMRU(savings) })]
                                : []),
                        "",
                        t("checkout.messages.total", { amount: formatMRU(total) }),
                        "",
                        t("checkout.messages.thanks"),
                ];

                const DEFAULT_STORE_WHATSAPP_NUMBER = "22233063926";
                const envStoreNumber = import.meta.env.VITE_STORE_WHATSAPP_NUMBER;
                const storeNumber = envStoreNumber?.replace(/\D/g, "") || DEFAULT_STORE_WHATSAPP_NUMBER;

                const whatsappURL = new URL("https://wa.me/" + storeNumber);
                whatsappURL.searchParams.set("text", messageLines.join("\n"));

                try {
                        if (typeof globalThis !== "undefined") {
                                globalThis.open?.(whatsappURL.toString(), "_blank");
                        }
                        sessionStorage.setItem("whatsappOrderSent", "true");
                        toast.success(t("checkout.messages.orderSent"));
                        await clearCart();
                        navigate("/purchase-success", {
                                state: { orderType: "whatsapp", orderDetails: orderDetailsPayload },
                        });
                } catch (error) {
                        console.error("Unable to automatically open WhatsApp order", error);
                        toast.error(t("common.messages.whatsAppOpenFailed"));
                }
        };

        return (
                <div className='bg-kingdom-ivory py-16'>
                        <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 lg:flex-row'>
                                <motion.section
                                        className='w-full rounded-[2rem] border border-kingdom-purple/15 bg-white/90 p-8 shadow-[0_28px_60px_-40px_rgba(34,18,40,0.45)] backdrop-blur-sm'
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4 }}
                                >
                                        <h1 className='mb-6 text-2xl font-semibold tracking-[0.18em] text-kingdom-purple'>{t("checkout.title")}</h1>
                                        <form className='space-y-5 text-kingdom-charcoal' onSubmit={handleSubmit}>
                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-kingdom-muted' htmlFor='customerName'>
                                                                {t("checkout.form.fullName")}
                                                        </label>
                                                        <input
                                                                id='customerName'
                                                                type='text'
                                                                value={customerName}
                                                                onChange={(event) => setCustomerName(event.target.value)}
                                                                className='w-full rounded-2xl border border-kingdom-purple/20 bg-white/90 px-5 py-3 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:border-kingdom-gold focus:outline-none focus:ring-2 focus:ring-kingdom-gold/40'
                                                                placeholder={t("checkout.form.fullNamePlaceholder")}
                                                                required
                                                        />
                                                </div>

                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-kingdom-muted' htmlFor='whatsAppNumber'>
                                                                {t("checkout.form.whatsApp")}
                                                        </label>
                                                        <input
                                                                id='whatsAppNumber'
                                                                type='tel'
                                                                value={whatsAppNumber}
                                                                onChange={handleWhatsAppChange}
                                                                className='w-full rounded-2xl border border-kingdom-purple/20 bg-white/90 px-5 py-3 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:border-kingdom-gold focus:outline-none focus:ring-2 focus:ring-kingdom-gold/40'
                                                                placeholder={t("checkout.form.whatsAppPlaceholder")}
                                                                required
                                                        />
                                                        {whatsAppError && <p className='text-sm text-rose-500'>{whatsAppError}</p>}
                                                </div>

                                                <div className='space-y-2'>
                                                        <label className='block text-sm font-medium text-kingdom-muted' htmlFor='address'>
                                                                {t("checkout.form.address")}
                                                        </label>
                                                        <textarea
                                                                id='address'
                                                                value={address}
                                                                onChange={(event) => setAddress(event.target.value)}
                                                                rows={4}
                                                                className='w-full rounded-2xl border border-kingdom-purple/20 bg-white/90 px-5 py-3 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:border-kingdom-gold focus:outline-none focus:ring-2 focus:ring-kingdom-gold/40'
                                                                placeholder={t("checkout.form.addressPlaceholder")}
                                                                required
                                                        />
                                                </div>

                                                <motion.button
                                                        type='submit'
                                                        disabled={!isFormValid}
                                                        className='w-full rounded-full bg-kingdom-gold px-6 py-3 text-base font-semibold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow disabled:opacity-60'
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.97 }}
                                                >
                                                        {t("checkout.sendButton")}
                                                </motion.button>
                                        </form>
                                </motion.section>

                                <motion.aside
                                        className='w-full rounded-[2rem] border border-kingdom-purple/15 bg-gradient-to-br from-white via-kingdom-cream/80 to-white p-8 text-kingdom-charcoal shadow-[0_28px_60px_-38px_rgba(34,18,40,0.45)] lg:max-w-sm'
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                        <h2 className='text-xl font-semibold tracking-[0.16em] text-kingdom-purple'>{t("checkout.summary.title")}</h2>
                                        <ul className='mt-4 space-y-3 text-sm text-kingdom-muted'>
                                                {cart.map((item) => {
                                                        const { price, discountedPrice, isDiscounted } = getProductPricing(item);
                                                        return (
                                                                <li key={item._id} className='flex justify-between gap-4 rounded-2xl border border-kingdom-purple/10 bg-white/70 px-4 py-3 shadow-[0_12px_26px_-24px_rgba(34,18,40,0.55)]'>
                                                                        <span className='font-medium text-kingdom-purple'>{item.name}</span>
                                                                        <span className='flex flex-col items-end'>
                                                                                {isDiscounted && (
                                                                                        <span className='text-xs text-kingdom-muted line-through'>
                                                                                                {formatNumberEn(item.quantity)} × {formatMRU(price)}
                                                                                        </span>
                                                                                )}
                                                                                <span className='text-kingdom-purple'>
                                                                                        {formatNumberEn(item.quantity)} × {formatMRU(discountedPrice)}
                                                                                </span>
                                                                        </span>
                                                                </li>
                                                        );
                                                })}
                                        </ul>

                                        <div className='mt-6 space-y-2 border-t border-kingdom-purple/15 pt-4 text-sm text-kingdom-muted'>
                                                <div className='flex justify-between'>
                                                        <span>{t("checkout.summary.subtotal")}</span>
                                                        <span>{formatMRU(subtotal)}</span>
                                                </div>
                                                {savings > 0 && (
                                                        <div className='flex justify-between text-kingdom-gold'>
                                                                <span>{t("checkout.summary.savings")}</span>
                                                                <span>-{formatMRU(savings)}</span>
                                                        </div>
                                                )}
                                                <div className='flex justify-between text-base font-semibold text-kingdom-purple'>
                                                        <span>{t("checkout.summary.total")}</span>
                                                        <span>{formatMRU(total)}</span>
                                                </div>
                                        </div>

                                        <p className='mt-4 text-xs text-kingdom-muted'>{t("checkout.summary.notice")}</p>
                                </motion.aside>
                        </div>
                </div>
        );
};

export default CheckoutPage;
