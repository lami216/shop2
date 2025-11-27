import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import GroupCard from "../components/cards/GroupCard";
import HelpCard from "../components/cards/HelpCard";
import PartnerCard from "../components/cards/PartnerCard";
import TutorCard from "../components/cards/TutorCard";
import ErrorBox from "../components/ui/ErrorBox";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useTranslation from "../hooks/useTranslation";
import { useUserStore } from "../stores/useUserStore";

const defaultFilters = {
        studyMode: "both",
        groupSize: "any",
        showOnlyVerified: false,
        showOnlyBadges: false,
};

const SearchPage = () => {
        const { t, i18n } = useTranslation();
        const [subjects, setSubjects] = useState([]);
        const [selectedSubject, setSelectedSubject] = useState("");
        const [searchType, setSearchType] = useState("");
        const [results, setResults] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [filtersOpen, setFiltersOpen] = useState(false);
        const [filters, setFilters] = useState(defaultFilters);
        const [requestVersion, setRequestVersion] = useState(0);
        const user = useUserStore((state) => state.user);

        const tabs = useMemo(
                () => [
                        { key: "partner", label: t("search.tabs.partner") },
                        { key: "groups", label: t("search.tabs.groups") },
                        { key: "tutors", label: t("search.tabs.tutors") },
                        { key: "help", label: t("search.tabs.help") },
                ],
                [t]
        );

        useEffect(() => {
                document.title = t("page.search.title") || "Moltaqa";
        }, [i18n.language, t]);

        useEffect(() => {
                const fetchSubjects = async () => {
                        try {
                                // TODO: replace with real fetch to /api/subjects once backend is ready
                                const tempSubjects = [
                                        { id: "math101", name: "Mathematics" },
                                        { id: "phys201", name: "Physics" },
                                        { id: "cs301", name: "Computer Science" },
                                        { id: "chem102", name: "Chemistry" },
                                ];
                                setSubjects(tempSubjects);
                        } catch (err) {
                                console.error("Failed to load subjects", err);
                        }
                };
                fetchSubjects();
        }, []);

        useEffect(() => {
                const shouldSearch = selectedSubject && searchType;
                if (!shouldSearch) return;

                const fetchMatches = async () => {
                        setLoading(true);
                        setError("");
                        try {
                                const response = await fetch("/api/search/match", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ subjectId: selectedSubject, searchType }),
                                });
                                if (!response.ok) {
                                        throw new Error("Unable to fetch matches");
                                }
                                const data = await response.json();
                                const sorted = Array.isArray(data?.results)
                                        ? [...data.results].sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0))
                                        : [];
                                setResults(sorted);
                        } catch (err) {
                                console.error(err);
                                setError("Something went wrong while fetching matches.");
                                setResults([]);
                        } finally {
                                setLoading(false);
                        }
                };

                fetchMatches();
        }, [searchType, selectedSubject, requestVersion]);

        const displayedResults = useMemo(() => {
                let filtered = [...results];

                if (filters.studyMode !== "both") {
                        filtered = filtered.filter((item) => (item?.mode || "").toLowerCase() === filters.studyMode);
                }

                if (searchType === "groups" && filters.groupSize !== "any") {
                        filtered = filtered.filter((item) => {
                                if (!item?.groupSize) return true;
                                if (filters.groupSize === "small") return item.groupSize <= 4;
                                if (filters.groupSize === "medium") return item.groupSize > 4 && item.groupSize <= 8;
                                if (filters.groupSize === "large") return item.groupSize > 8;
                                return true;
                        });
                }

                if (searchType === "tutors") {
                        if (filters.showOnlyVerified) {
                                filtered = filtered.filter((item) => item?.verified);
                        }
                        if (filters.showOnlyBadges) {
                                filtered = filtered.filter((item) => Boolean(item?.badge));
                        }
                }

                return filtered;
        }, [filters, results, searchType]);

        const handleTabChange = (key) => {
                setSearchType(key);
                setResults([]);
        };

        const handleRetry = () => setRequestVersion((prev) => prev + 1);

        const toggleFilters = () => setFiltersOpen((prev) => !prev);

        const renderCard = (item, index) => {
                if (searchType === "partner") return <PartnerCard key={index} partner={item} />;
                if (searchType === "groups") return <GroupCard key={index} group={item} />;
                if (searchType === "tutors") return <TutorCard key={index} tutor={item} />;
                return <HelpCard key={index} profile={item} />;
        };

        if (!user) {
                return (
                        <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                                <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pb-24 pt-24 text-center sm:px-6'>
                                        <h1 className='text-3xl font-bold text-kingdom-gold'>{t("page.search.heading")}</h1>
                                        <p className='text-kingdom-ivory/70'>Please log in to use this feature.</p>
                                        <Link
                                                to='/login'
                                                className='rounded-full bg-kingdom-gold px-4 py-2 font-semibold text-kingdom-charcoal transition hover:bg-amber-300'
                                        >
                                                {t("nav.login")}
                                        </Link>
                                        {/* TODO: replace with proper ProtectedRoute guard */}
                                </div>
                        </div>
                );
        }

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-32 pt-24 sm:px-6 lg:px-8'>
                                <div className='flex flex-col gap-4 rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft sm:p-6'>
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                                <div className='flex flex-col gap-2 sm:w-2/3'>
                                                        <h1 className='text-3xl font-bold text-kingdom-gold'>{t("page.search.heading")}</h1>
                                                        <p className='text-sm text-kingdom-ivory/70'>
                                                                {t("search.resultsHint")}
                                                                {/* TODO: extend copy once onboarding content is ready */}
                                                        </p>
                                                </div>
                                                <div className='sm:w-1/3'>
                                                        <label className='flex flex-col gap-2 text-sm text-kingdom-ivory/70'>
                                                                <span>{t("search.selectSubject")}</span>
                                                                <select
                                                                        value={selectedSubject}
                                                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                                                        disabled={loading}
                                                                        className='w-full rounded-xl border border-kingdom-gold/30 bg-[#0f0716] px-3 py-2 text-kingdom-ivory outline-none ring-kingdom-gold/40 focus:ring disabled:opacity-50'
                                                                >
                                                                        <option value=''>{t("search.chooseSubject")}</option>
                                                                        {subjects.map((subject) => (
                                                                                <option key={subject.id} value={subject.id}>
                                                                                        {subject.name}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                                {/* TODO: replace temp subject list with GET /api/subjects */}
                                                        </label>
                                                </div>
                                        </div>

                                        <div className='flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center'>
                                                <div className='flex w-full overflow-x-auto rounded-xl border border-kingdom-gold/10 bg-kingdom-purple/30 p-1 text-sm sm:w-auto'>
                                                        {tabs.map((tab) => (
                                                                <button
                                                                        key={tab.key}
                                                                        onClick={() => handleTabChange(tab.key)}
                                                                        disabled={loading}
                                                                        className={`min-w-[120px] whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all focus:outline-none focus-visible:ring focus-visible:ring-kingdom-gold/50 disabled:opacity-60 ${
                                                                                searchType === tab.key
                                                                                        ? "bg-kingdom-gold text-kingdom-charcoal shadow-royal-soft"
                                                                                        : "bg-transparent text-kingdom-ivory/80 hover:bg-kingdom-purple/60"
                                                                        }`}
                                                                >
                                                                        {tab.label}
                                                                </button>
                                                        ))}
                                                </div>
                                                <button
                                                        onClick={toggleFilters}
                                                        className='hidden rounded-full border border-kingdom-gold/30 bg-kingdom-purple/40 px-4 py-2 text-sm font-semibold text-kingdom-ivory transition hover:border-kingdom-gold/50 hover:bg-kingdom-purple/70 sm:inline-flex'
                                                >
                                                        {t("common.filters")}
                                                </button>
                                        </div>

                                        <button
                                                onClick={toggleFilters}
                                                className='sm:hidden rounded-full border border-kingdom-gold/30 bg-kingdom-purple/40 px-4 py-2 text-sm font-semibold text-kingdom-ivory transition hover:border-kingdom-gold/50 hover:bg-kingdom-purple/70'
                                        >
                                                {t("common.filters")}
                                        </button>
                                </div>

                                <div className='flex flex-col gap-3 rounded-2xl border border-kingdom-gold/10 bg-black/40 p-4 shadow-royal-soft sm:p-6'>
                                        <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
                                                <div>
                                                        <h2 className='text-xl font-semibold text-kingdom-ivory'>{t("search.resultsTitle")}</h2>
                                                        <p className='text-sm text-kingdom-ivory/60'>{t("search.resultsHint")}</p>
                                                </div>
                                                {selectedSubject && searchType && (
                                                        <span className='text-sm text-kingdom-ivory/70'>
                                                                {t("search.matchesCount", { count: displayedResults.length })}
                                                        </span>
                                                )}
                                        </div>

                                        {error && <ErrorBox message={error} onRetry={handleRetry} />}
                                        {loading && <LoadingSpinner label={t("common.loading")} />}
                                        {!loading && selectedSubject && searchType && displayedResults.length === 0 && !error && (
                                                <p className='text-sm text-kingdom-ivory/60'>{t("search.emptyState") || "No matching results for this subject"}</p>
                                        )}

                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                {displayedResults.map((item, index) => renderCard(item, index))}
                                        </div>

                                        {!selectedSubject || !searchType ? (
                                                <p className='rounded-xl border border-dashed border-kingdom-gold/30 bg-kingdom-plum/20 p-4 text-sm text-kingdom-ivory/70'>
                                                        {t("search.startState")}
                                                </p>
                                        ) : null}

                                        {/* TODO: unify sorting with backend ordering */}
                                </div>
                        </div>

                        {filtersOpen && (
                                <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 sm:items-center sm:px-0'>
                                        <div className='w-full max-w-md rounded-2xl border border-kingdom-gold/30 bg-[#0f0716] p-4 text-kingdom-ivory shadow-royal-soft sm:max-h-[80vh] sm:p-6'>
                                                <div className='mb-4 flex items-center justify-between'>
                                                        <h3 className='text-lg font-semibold'>Filters</h3>
                                                        <button
                                                                onClick={() => setFiltersOpen(false)}
                                                                className='rounded-full px-3 py-1 text-sm text-kingdom-ivory/70 hover:bg-kingdom-purple/40'
                                                        >
                                                                Close
                                                        </button>
                                                </div>

                                                <div className='flex flex-col gap-4'>
                                                        <div className='flex flex-col gap-2'>
                                                                <p className='text-sm text-kingdom-ivory/70'>Study mode</p>
                                                                <div className='grid grid-cols-3 gap-2'>
                                                                        {[
                                                                                { label: "Online", value: "online" },
                                                                                { label: "Offline", value: "offline" },
                                                                                { label: "Both", value: "both" },
                                                                        ].map((option) => (
                                                                                <button
                                                                                        key={option.value}
                                                                                        onClick={() => setFilters((prev) => ({ ...prev, studyMode: option.value }))}
                                                                                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                                                                                filters.studyMode === option.value
                                                                                                        ? "bg-kingdom-gold text-kingdom-charcoal"
                                                                                                        : "border border-kingdom-gold/20 bg-kingdom-purple/30 text-kingdom-ivory/80 hover:border-kingdom-gold/40"
                                                                                        }`}
                                                                                >
                                                                                        {option.label}
                                                                                </button>
                                                                        ))}
                                                                </div>
                                                        </div>

                                                        {searchType === "groups" && (
                                                                <div className='flex flex-col gap-2'>
                                                                        <p className='text-sm text-kingdom-ivory/70'>Group size</p>
                                                                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                                                                                {[
                                                                                        { label: "Any", value: "any" },
                                                                                        { label: "Small", value: "small" },
                                                                                        { label: "Medium", value: "medium" },
                                                                                        { label: "Large", value: "large" },
                                                                                ].map((option) => (
                                                                                        <button
                                                                                                key={option.value}
                                                                                                onClick={() => setFilters((prev) => ({ ...prev, groupSize: option.value }))}
                                                                                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                                                                                        filters.groupSize === option.value
                                                                                                                ? "bg-kingdom-gold text-kingdom-charcoal"
                                                                                                                : "border border-kingdom-gold/20 bg-kingdom-purple/30 text-kingdom-ivory/80 hover:border-kingdom-gold/40"
                                                                                                }`}
                                                                                        >
                                                                                                {option.label}
                                                                                        </button>
                                                                                ))}
                                                                        </div>
                                                                </div>
                                                        )}

                                                        {searchType === "tutors" && (
                                                                <div className='flex flex-col gap-3 rounded-xl border border-kingdom-gold/20 bg-kingdom-purple/20 p-3'>
                                                                        <label className='flex items-center gap-2 text-sm'>
                                                                                <input
                                                                                        type='checkbox'
                                                                                        checked={filters.showOnlyVerified}
                                                                                        onChange={(e) => setFilters((prev) => ({ ...prev, showOnlyVerified: e.target.checked }))}
                                                                                        className='h-4 w-4 accent-kingdom-gold'
                                                                                />
                                                                                <span>Show only verified tutors</span>
                                                                        </label>
                                                                        <label className='flex items-center gap-2 text-sm'>
                                                                                <input
                                                                                        type='checkbox'
                                                                                        checked={filters.showOnlyBadges}
                                                                                        onChange={(e) => setFilters((prev) => ({ ...prev, showOnlyBadges: e.target.checked }))}
                                                                                        className='h-4 w-4 accent-kingdom-gold'
                                                                                />
                                                                                <span>Show only badge holders</span>
                                                                        </label>
                                                                        {/* TODO: connect filters to backend query params */}
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        )}

                        <Link
                                to='/student/profile'
                                className='fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-kingdom-gold p-4 text-2xl font-bold text-kingdom-charcoal shadow-royal-glow transition hover:scale-105 hover:bg-kingdom-ivory'
                                aria-label='Create a new ad'
                        >
                                +
                                {/* TODO: integrate multi-step ad creation modal */}
                        </Link>
                </div>
        );
};

export default SearchPage;
