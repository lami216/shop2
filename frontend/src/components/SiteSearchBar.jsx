import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import PropTypes from "prop-types";
import useTranslation from "../hooks/useTranslation";

const SiteSearchBar = ({
        value,
        defaultValue = "",
        placeholder,
        onChange,
        onSubmit,
        actionLabel,
        className,
        children,
}) => {
        const { t } = useTranslation();
        const generatedId = useId();
        const inputId = useMemo(() => `site-search-${generatedId}`, [generatedId]);
        const [internalValue, setInternalValue] = useState(defaultValue);

        useEffect(() => {
                setInternalValue(defaultValue);
        }, [defaultValue]);

        const currentValue = value !== undefined ? value : internalValue;

        const handleChange = (event) => {
                if (value === undefined) {
                        setInternalValue(event.target.value);
                }

                onChange?.(event.target.value);
        };

        const handleSubmit = (event) => {
                event.preventDefault();
                onSubmit?.(value !== undefined ? value : internalValue);
        };

        const containerClassName = ["px-4 py-6", className].filter(Boolean).join(" ");

        return (
                <div className={containerClassName}>
                        <form
                                onSubmit={handleSubmit}
                                className='mx-auto flex max-w-3xl flex-col gap-4 rounded-[2.25rem] border border-kingdom-gold/25 bg-white/10 p-5 text-kingdom-cream shadow-[0_24px_45px_-30px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5'
                        >
                                <label htmlFor={inputId} className='sr-only'>
                                        {t("nav.search")}
                                </label>
                                <div className='flex w-full items-center rounded-full border border-kingdom-gold/40 bg-gradient-to-r from-white/20 via-white/10 to-transparent pl-4 pr-2 shadow-[0_12px_30px_-18px_rgba(212,175,55,0.25)] transition focus-within:border-kingdom-gold focus-within:shadow-royal-glow'>
                                        <Search className='h-5 w-5 text-kingdom-cream/70' aria-hidden='true' />
                                        <input
                                                id={inputId}
                                                type='search'
                                                value={currentValue}
                                                onChange={handleChange}
                                                placeholder={placeholder || t("nav.searchPlaceholder")}
                                                className='w-full border-none bg-transparent px-3 py-3 text-base text-kingdom-cream placeholder:text-kingdom-cream/40 focus:outline-none'
                                        />
                                        <button
                                                type='submit'
                                                className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-kingdom-gold/60 bg-kingdom-gold/20 text-kingdom-gold transition hover:bg-kingdom-gold/30'
                                                aria-label={actionLabel || t("nav.search")}
                                        >
                                                <Search className='h-4 w-4' />
                                        </button>
                                </div>
                                {children && <div className='flex w-full flex-wrap items-center justify-between gap-3 text-sm text-kingdom-cream/70'>{children}</div>}
                        </form>
                </div>
        );
};

export default SiteSearchBar;

SiteSearchBar.propTypes = {
        value: PropTypes.string,
        defaultValue: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onSubmit: PropTypes.func,
        actionLabel: PropTypes.string,
        className: PropTypes.string,
        children: PropTypes.node,
};
