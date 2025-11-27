import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import apiClient from "../lib/apiClient";

const PeopleAlsoBought = ({ productId, category }) => {
        const [recommendations, setRecommendations] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const { t } = useTranslation();
        const recommendationsErrorMessage = t("toast.recommendationsError");

        useEffect(() => {
                let isCancelled = false;

                const fetchRecommendations = async () => {
                        setIsLoading(true);

                        try {
                                const queryParams = new URLSearchParams();

                                if (productId) {
                                        queryParams.append("productId", productId);
                                }

                                if (category) {
                                        queryParams.append("category", category);
                                }

                                const endpoint = queryParams.toString()
                                        ? `/products/recommendations?${queryParams.toString()}`
                                        : `/products/recommendations`;

                                const data = await apiClient.get(endpoint);

                                if (!isCancelled) {
                                        setRecommendations(Array.isArray(data) ? data : []);
                                }
                        } catch (error) {
                                if (!isCancelled) {
                                        toast.error(
                                                error.response?.data?.message || recommendationsErrorMessage
                                        );
                                }
                        } finally {
                                if (!isCancelled) {
                                        setIsLoading(false);
                                }
                        }
                };

                fetchRecommendations();

                return () => {
                        isCancelled = true;
                };
        }, [productId, category, recommendationsErrorMessage]);

        if (isLoading) return <LoadingSpinner />;

        return (
                <section className='rounded-[2rem] border border-kingdom-purple/10 bg-white/90 p-8 shadow-[0_25px_55px_-38px_rgba(34,18,40,0.5)] backdrop-blur-sm'>
                        <h3 className='text-2xl font-semibold tracking-[0.16em] text-kingdom-purple'>
                                {t("cart.recommendations.title")}
                        </h3>
                        <p className='mt-2 text-sm text-kingdom-muted'>
                                عطورا تكمل تجربتك الفاخرة بتوقيع ملتقى Moltaqa.
                        </p>
                        <div className='mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                {recommendations.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                ))}
                        </div>
                </section>
        );
};
export default PeopleAlsoBought;

PeopleAlsoBought.propTypes = {
        productId: PropTypes.string,
        category: PropTypes.string,
};
