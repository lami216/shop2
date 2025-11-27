import { createContext, useContext, useEffect, useMemo, useState } from "react";
import baseArabic from "../locales/ar/translation.json";

const STORAGE_KEY = "moltaqaLang";
const DEFAULT_LANGUAGE = "ar";

const translations = {
        ar: {
                ...baseArabic,
                home: {
                        ...(baseArabic.home || {}),
                        heading: "ملتقى Moltaqa",
                        subtitle: "منصة التعليم والتواصل القادمة مع تركيز على المطابقة الذكية.",
                        placeholderCard: "بحث وتطابق – ملتقى (تجريبي). TODO: مزيد من التجهيزات لاحقاً.",
                },
                nav: {
                        ...(baseArabic.nav || {}),
                        home: "الرئيسية",
                        search: "البحث",
                        studentProfile: "ملف الطالب",
                        tutorProfile: "ملف المعلم",
                        adminDashboard: "لوحة المشرف",
                        messages: "الرسائل",
                        dashboard: baseArabic.nav?.dashboard || "لوحة التحكم",
                },
                common: {
                        ...(baseArabic.common || {}),
                        subject: "المادة",
                        level: "المستوى",
                        mode: "الوضع",
                        save: "حفظ",
                        filters: "الفلاتر",
                        noResults: "لا توجد نتائج",
                        resultsCount: "{{count}} نتيجة",
                        back: "عودة",
                        loading: baseArabic.common?.loading || "جاري التحميل...",
                },
                page: {
                        home: { title: "ملتقى – الرئيسية" },
                        search: { title: "ملتقى – البحث", heading: "البحث والتطابق" },
                        studentProfile: { title: "ملتقى – ملف الطالب", heading: "ملف الطالب" },
                        tutorProfile: { title: "ملتقى – ملف المعلم", heading: "ملف المعلم" },
                        chat: { title: "ملتقى – الرسائل", heading: "المراسلات" },
                        admin: { title: "ملتقى – لوحة المشرف", heading: "لوحة المشرف" },
                },
                student: {
                        ...(baseArabic.student || {}),
                        ads: { title: "إعلاناتي" },
                        payments: { title: "مدفوعات الدراسة" },
                        profile: {
                                subtitle: "ابن ملفك، أدر إعلانات الدراسة، واضبط تواجدك للتطابقات القادمة.",
                        },
                },
                search: {
                        selectSubject: "اختر المادة",
                        chooseSubject: "اختر مادة",
                        resultsTitle: "نتائج البحث",
                        resultsHint: "اختر مادة ونوع البحث للبدء",
                        matchesCount: "{{count}} نتيجة",
                        tabs: {
                                partner: "شريك",
                                groups: "مجموعات",
                                tutors: "معلمون",
                                help: "مساعدة",
                        },
                        filtersTitle: "الفلاتر",
                        filtersOpen: "الفلاتر",
                        emptyState: "لا توجد نتائج حالياً. جرّب ضبط الفلاتر.",
                        startState: "اختر مادة ونوع بحث لاستعراض التطابقات.",
                },
                tutor: {
                        ...(baseArabic.tutor || {}),
                        stats: { empty: "لا توجد بيانات أرباح بعد" },
                        profileSubtitle: "حدّث بيانات التدريس والتسعير والتخصصات الخاصة بك.",
                },
                chat: {
                        empty: "لا توجد محادثات حتى الآن",
                        loginPrompt: "يرجى تسجيل الدخول للوصول إلى رسائلك",
                },
                admin: {
                        sections: {
                                overview: "نظرة عامة",
                                users: "المستخدمون",
                                tutors: "المعلمون",
                                ads: "الإعلانات",
                                payments: "المدفوعات",
                                academics: "الأكاديميات",
                                badges: "الشارات",
                        },
                },
                // TODO: add more Arabic strings as flows expand
        },
        fr: {
                        home: {
                                heading: "Moltaqa",
                                subtitle: "Plateforme d'apprentissage et de rencontre, version d'essai.",
                                placeholderCard: "Recherche et correspondance – Moltaqa (brouillon). TODO : plus de contenu bientôt.",
                        },
                        search: {
                                selectSubject: "Choisir une matière",
                                chooseSubject: "Sélectionnez une matière",
                                resultsTitle: "Résultats de recherche",
                                resultsHint: "Choisissez une matière et un type pour commencer",
                                matchesCount: "{{count}} résultats",
                                tabs: {
                                        partner: "Partenaire",
                                        groups: "Groupes",
                                        tutors: "Tuteurs",
                                        help: "Aide",
                                },
                                filtersTitle: "Filtres",
                                filtersOpen: "Filtres",
                                emptyState: "Aucun résultat pour le moment. Ajustez les filtres.",
                                startState: "Sélectionnez une matière et un onglet pour lancer la recherche.",
                        },
                        nav: {
                                home: "Accueil",
                                search: "Recherche",
                                studentProfile: "Profil Étudiant",
                                tutorProfile: "Profil Tuteur",
                                adminDashboard: "Admin",
                                messages: "Messages",
                                dashboard: "Tableau de bord",
                                login: "Connexion",
                                signup: "Inscription",
                                logout: "Déconnexion",
                        },
                        common: {
                                appName: "Moltaqa",
                                loading: "Chargement...",
                                subject: "Sujet",
                                level: "Niveau",
                                mode: "Mode",
                                save: "Enregistrer",
                                filters: "Filtres",
                                noResults: "Aucun résultat",
                                resultsCount: "{{count}} résultats",
                                back: "Retour",
                        },
                        page: {
                                home: { title: "Moltaqa – Accueil" },
                                search: { title: "Moltaqa – Recherche", heading: "Recherche et correspondance" },
                                studentProfile: { title: "Moltaqa – Profil étudiant", heading: "Profil étudiant" },
                                tutorProfile: { title: "Moltaqa – Profil tuteur", heading: "Profil tuteur" },
                                chat: { title: "Moltaqa – Messages", heading: "Messagerie" },
                                admin: { title: "Moltaqa – Tableau administrateur", heading: "Tableau administrateur" },
                        },
                        student: {
                                ads: { title: "Mes annonces" },
                                payments: { title: "Paiements" },
                                profile: {
                                        subtitle: "Construisez votre profil, gérez vos annonces et préparez les mises en relation.",
                                },
                        },
                        tutor: {
                                stats: { empty: "Aucun revenu pour le moment" },
                                profileSubtitle: "Mettez à jour vos informations d'enseignement et vos tarifs.",
                        },
                        chat: {
                                empty: "Pas encore de conversations",
                                loginPrompt: "Connectez-vous pour accéder à vos messages",
                        },
                        admin: {
                                sections: {
                                        overview: "Vue d'ensemble",
                                        users: "Utilisateurs",
                                        tutors: "Tuteurs",
                                        ads: "Annonces",
                                        payments: "Paiements",
                                        academics: "Programmes",
                                        badges: "Badges",
                                },
                        },
                        // TODO: add English and more French strings later
        },
};

const I18nContext = createContext({
        currentLanguage: DEFAULT_LANGUAGE,
        setLanguage: () => {},
        t: (key) => key,
});

const getValueByKey = (source, key) => {
        return key.split(".").reduce((acc, segment) => {
                if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
                        return acc[segment];
                }
                return undefined;
        }, source);
};

const formatTemplate = (template, options = {}) => {
        if (typeof template !== "string") return template;
        return template.replace(/{{(.*?)}}/g, (_, token) => {
                const cleanedToken = token.trim();
                return Object.prototype.hasOwnProperty.call(options, cleanedToken)
                        ? options[cleanedToken]
                        : "";
        });
};

export const I18nProvider = ({ children }) => {
        const [currentLanguage, setCurrentLanguage] = useState(() => {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored || DEFAULT_LANGUAGE;
        });

        useEffect(() => {
                const dir = currentLanguage === "ar" ? "rtl" : "ltr";
                document.documentElement.dir = dir;
                document.documentElement.lang = currentLanguage;
                if (dir === "rtl") {
                        document.body.classList.add("rtl");
                } else {
                        document.body.classList.remove("rtl");
                }
        }, [currentLanguage]);

        const setLanguage = (lang) => {
                const normalized = translations[lang] ? lang : DEFAULT_LANGUAGE;
                setCurrentLanguage(normalized);
                localStorage.setItem(STORAGE_KEY, normalized);
        };

        const t = (key, options = {}) => {
                const fromCurrent = getValueByKey(translations[currentLanguage] || {}, key);
                const fromFallback = getValueByKey(translations[DEFAULT_LANGUAGE] || {}, key);
                const value = fromCurrent ?? fromFallback;

                if (value === undefined) return key;
                if (typeof value === "string") return formatTemplate(value, options);
                if (Array.isArray(value)) return value.map((item) => formatTemplate(item, options));
                if (typeof value === "object") return JSON.parse(JSON.stringify(value));
                return value;
        };

        const contextValue = useMemo(
                () => ({ currentLanguage, setLanguage, t }),
                [currentLanguage]
        );

        return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
        const context = useContext(I18nContext);
        if (!context) {
                throw new Error("useI18n must be used within I18nProvider");
        }
        return context;
};

export default I18nContext;
