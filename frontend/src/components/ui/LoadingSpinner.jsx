import useTranslation from "../../hooks/useTranslation";

const LoadingSpinner = ({ label = "" }) => {
        const { t } = useTranslation();

        return (
                <div className='flex w-full items-center justify-center py-8 text-kingdom-ivory'>
                        <div className='flex items-center gap-3 rounded-full border border-kingdom-gold/30 bg-black/30 px-4 py-2 shadow-royal-soft'>
                                <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-kingdom-gold/30 border-t-kingdom-gold' />
                                <span className='text-sm font-semibold text-kingdom-gold'>
                                        {label || t("common.loading") || "Loading..."}
                                </span>
                                {/* TODO: upgrade spinner visuals with themed animation */}
                        </div>
                </div>
        );
};

export default LoadingSpinner;
