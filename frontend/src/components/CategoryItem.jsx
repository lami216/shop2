import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useTranslation from "../hooks/useTranslation";

const CategoryItem = ({ category }) => {
        const { t } = useTranslation();
        const hasImage = Boolean(category.imageUrl);

        return (
                <motion.article
                        whileHover={{ y: -12 }}
                        className='group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 shadow-[0_28px_65px_-45px_rgba(0,0,0,0.8)] backdrop-blur-lg'
                >
                        <Link to={`/category/${category.slug}`} className='block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-kingdom-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'>
                                <div className='relative h-72 w-full overflow-hidden'>
                                        {hasImage ? (
                                                <img
                                                        src={category.imageUrl}
                                                        alt={category.name}
                                                        loading='lazy'
                                                        className='h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105'
                                                />
                                        ) : (
                                                <div className='h-full w-full bg-gradient-to-br from-kingdom-plum via-kingdom-purple to-[#0E0712]' />
                                        )}
                                        <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-kingdom-plum/60 to-[#0A050D] opacity-90 transition duration-500 group-hover:opacity-100' />
                                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.28),_transparent_55%)] opacity-0 transition duration-500 group-hover:opacity-100' />
                                        <div className='absolute inset-x-0 bottom-0 p-8'>
                                                <h3 className='text-2xl font-semibold tracking-[0.18em] text-kingdom-cream'>
                                                        {category.name}
                                                </h3>
                                                <p className='mt-3 text-sm leading-relaxed text-kingdom-cream/70'>
                                                        {t("categories.explore", { category: category.name })}
                                                </p>
                                                <span className='mt-5 inline-flex items-center gap-2 rounded-full border border-kingdom-gold/50 bg-kingdom-gold/15 px-5 py-2 text-xs font-semibold tracking-[0.24em] text-kingdom-gold transition duration-300 group-hover:bg-kingdom-gold/25'>
                                                        {t("categories.cta")}
                                                </span>
                                        </div>
                                </div>
                        </Link>
                </motion.article>
        );
};

export default CategoryItem;
