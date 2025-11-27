import { useI18n } from "../lib/i18n";

export const useTranslation = () => {
        const { t, currentLanguage, setLanguage } = useI18n();

        return {
                t,
                i18n: {
                        language: currentLanguage,
                        changeLanguage: setLanguage,
                        t,
                },
        };
};

export default useTranslation;
