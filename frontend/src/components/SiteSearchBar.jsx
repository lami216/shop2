import { Search } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

const SiteSearchBar = () => {
  const { t } = useTranslation();

  return (
    <div className='bg-kingdom-ivory/95 px-4 py-4 shadow-royal-soft/40 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-4xl flex-col items-center gap-3 rounded-3xl border border-kingdom-gold/20 bg-white/80 p-4 shadow-royal-soft/60 sm:flex-row sm:gap-4'>
        <label htmlFor='site-search' className='sr-only'>
          {t("nav.search")}
        </label>
        <div className='flex w-full items-center rounded-full border border-kingdom-gold/40 bg-white/95 pl-4 shadow-[0_12px_30px_-18px_rgba(34,18,40,0.35)] transition-royal focus-within:border-kingdom-gold focus-within:shadow-royal-glow'>
          <Search className='h-5 w-5 text-kingdom-muted' aria-hidden='true' />
          <input
            id='site-search'
            type='search'
            placeholder='ابحث عن عطرك المفضل'
            className='w-full border-none bg-transparent px-3 py-2 text-base text-kingdom-charcoal placeholder:text-kingdom-muted focus:outline-none'
          />
          <button
            type='button'
            className='mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-kingdom-gold text-kingdom-charcoal shadow-[0_0_0_rgba(0,0,0,0)] transition-royal focus-outline hover:shadow-royal-glow'
            aria-label={t("nav.search")}
          >
            <Search className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteSearchBar;
