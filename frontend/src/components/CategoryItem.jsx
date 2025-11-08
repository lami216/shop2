import { Link } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";

const CategoryItem = ({ category }) => {
        const { t } = useTranslation();
        return (
                <div className='group relative h-full w-full overflow-hidden rounded-3xl border border-kingdom-purple/10 bg-white shadow-[0_18px_36px_-24px_rgba(34,18,40,0.45)] transition-royal hover:-translate-y-1.5 hover:shadow-royal-soft'>
                        <Link to={`/category/${category.slug}`} className='flex h-full flex-col focus-outline'>
                                <div className='relative h-48 w-full overflow-hidden sm:h-52'>
                                        <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                className='h-full w-full object-cover transition-royal duration-220 group-hover:scale-105'
                                                loading='lazy'
                                        />
                                        <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-kingdom-purple/25 to-kingdom-plum/70 opacity-70 transition-royal group-hover:opacity-90' />
                                </div>
                                <div className='flex flex-1 flex-col gap-3 p-6'>
                                        <h3 className='text-xl font-semibold tracking-[0.12em] text-kingdom-charcoal'>
                                                {category.name}
                                        </h3>
                                        <p className='text-sm leading-relaxed text-kingdom-muted'>
                                                {t("categories.explore", { category: category.name })}
                                        </p>
                                        <span className='mt-auto inline-flex items-center gap-2 self-start rounded-full border border-kingdom-gold/40 bg-kingdom-gold/10 px-4 py-1 text-xs font-semibold text-kingdom-gold transition-royal group-hover:bg-kingdom-gold/20'>
                                                اكتشف الآن
                                        </span>
                                </div>
                        </Link>
                </div>
        );
};

export default CategoryItem;
