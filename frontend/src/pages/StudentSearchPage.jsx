import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiClient } from "../lib/apiClient";

const accentColor = "#0097A7";

const MatchCard = ({ match }) => {
        const initials = useMemo(() => {
                if (!match?.fullName) return "؟";
                const parts = match.fullName.trim().split(/\s+/);
                if (parts.length === 1) return parts[0][0] || "؟";
                return `${parts[0][0] || ""}${parts[1][0] || ""}`;
        }, [match?.fullName]);

        return (
                <div className='flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex w-full items-start gap-4 sm:items-center'>
                                <div
                                        className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white shadow-md'
                                        style={{ backgroundColor: accentColor }}
                                >
                                        {match?.avatarUrl ? (
                                                <img
                                                        src={match.avatarUrl}
                                                        alt={match.fullName || "avatar"}
                                                        className='h-full w-full rounded-full object-cover'
                                                />
                                        ) : (
                                                <span>{initials}</span>
                                        )}
                                </div>
                                <div className='flex-1 space-y-1 text-right'>
                                        <h3 className='text-lg font-semibold text-slate-900'>{match?.fullName || "—"}</h3>
                                        <p className='text-sm text-slate-600'>
                                                الكلية: {match?.collegeName || "—"}
                                                {match?.levelLabel ? ` · المستوى: ${match.levelLabel}` : ""}
                                        </p>
                                        <p className='text-sm text-slate-600'>المواد: {match?.subjectsLabel || "—"}</p>
                                        {match?.helpTypeLabel && (
                                                <p className='text-sm text-slate-500'>نوع المساعدة: {match.helpTypeLabel}</p>
                                        )}
                                </div>
                        </div>
                        <div className='flex w-full flex-col gap-3 sm:w-auto sm:items-end'>
                                <div className='text-sm font-medium text-slate-700'>
                                        نسبة التوافق: {match?.matchPercent != null ? `${match.matchPercent}%` : "—"}
                                </div>
                                <div className='flex flex-wrap justify-end gap-2'>
                                        <button
                                                type='button'
                                                onClick={() => alert("Request join (stub)")}
                                                className='rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md'
                                                style={{ backgroundColor: accentColor }}
                                        >
                                                طلب انضمام
                                        </button>
                                        <button
                                                type='button'
                                                onClick={() => alert("Open chat (stub)")}
                                                className='rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50'
                                        >
                                                تواصل
                                        </button>
                                </div>
                        </div>
                </div>
        );
};

const LoadingSpinner = () => (
        <div className='flex items-center justify-center py-10'>
                <div
                        className='h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-transparent'
                        style={{ borderTopColor: accentColor }}
                />
        </div>
);

const EmptyState = ({ message }) => (
        <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600'>
                {message}
        </div>
);

const TabButton = ({ label, value, isActive, onClick }) => (
        <button
                type='button'
                onClick={() => onClick(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none ${
                        isActive
                                ? "text-white shadow" 
                                : "text-slate-600 hover:bg-slate-100"
                }`}
                style={isActive ? { backgroundColor: accentColor } : undefined}
        >
                {label}
        </button>
);

const StudentSearchPage = () => {
        const [subjects, setSubjects] = useState([]);
        const [selectedSubjectId, setSelectedSubjectId] = useState("");
        const [matchType, setMatchType] = useState("review");
        const [matches, setMatches] = useState([]);
        const [loadingSubjects, setLoadingSubjects] = useState(false);
        const [loadingMatches, setLoadingMatches] = useState(false);
        const [errorMessage, setErrorMessage] = useState("");

        const navigate = useNavigate();

        useEffect(() => {
                const fetchSubjects = async () => {
                        setLoadingSubjects(true);
                        setErrorMessage("");
                        try {
                                const data = await apiClient.get("/api/moltaqa/subjects");
                                const fetchedSubjects = Array.isArray(data) ? data : data?.subjects || [];
                                setSubjects(fetchedSubjects);
                                if (fetchedSubjects?.length) {
                                        setSelectedSubjectId((prev) => prev || fetchedSubjects[0]._id || fetchedSubjects[0].id || "");
                                }
                        } catch (error) {
                                if (error?.response?.status === 401) {
                                        navigate("/login");
                                        return;
                                }
                                const message = error?.message || "تعذر تحميل المواد";
                                setErrorMessage(message);
                                toast.error(message);
                        } finally {
                                setLoadingSubjects(false);
                        }
                };

                fetchSubjects();
        }, [navigate]);

        useEffect(() => {
                const searchMatches = async () => {
                        if (!selectedSubjectId) {
                                setMatches([]);
                                return;
                        }
                        setLoadingMatches(true);
                        setErrorMessage("");
                        try {
                                const payload = { subjectId: selectedSubjectId, matchType };
                                const data = await apiClient.post("/api/moltaqa/search", payload);
                                const results = Array.isArray(data) ? data : data?.matches || [];
                                setMatches(results);
                        } catch (error) {
                                if (error?.response?.status === 401) {
                                        navigate("/login");
                                        return;
                                }
                                const message = error?.message || "حدث خطأ أثناء البحث";
                                setErrorMessage(message);
                                toast.error(message);
                        } finally {
                                setLoadingMatches(false);
                        }
                };

                searchMatches();
        }, [matchType, navigate, selectedSubjectId]);

        return (
                <div dir='rtl' className='bg-white min-h-[calc(100vh-6rem)]'>
                        <div className='mx-auto max-w-4xl px-4 py-6 sm:py-8'>
                                <header className='mb-6 space-y-2 text-right sm:mb-8'>
                                        <h1 className='text-2xl font-bold text-slate-900 sm:text-3xl'>منصة مطابقة الطلاب</h1>
                                        <p className='text-sm text-slate-600 sm:text-base'>اختر المادة ثم تصفّح الشركاء المقترحين حسب نسبة التوافق.</p>
                                </header>

                                <section className='rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 sm:p-6'>
                                        <div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between'>
                                                <div className='w-full sm:w-2/3'>
                                                        <label className='block text-sm font-semibold text-slate-800'>اختر المادة التي تبحث عنها</label>
                                                        <div className='mt-2'>
                                                                <select
                                                                        value={selectedSubjectId}
                                                                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                                                                        className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-slate-800 shadow-sm focus:border-[color:var(--accent-color)] focus:outline-none focus:ring'
                                                                        style={{ "--accent-color": accentColor }}
                                                                >
                                                                        <option value=''>اختر مادة…</option>
                                                                        {subjects.map((subject) => (
                                                                                <option key={subject._id || subject.id} value={subject._id || subject.id}>
                                                                                        {subject.name || subject.title}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </div>
                                                        {loadingSubjects && <p className='mt-2 text-sm text-slate-500'>جاري تحميل المواد…</p>}
                                                </div>
                                                <div className='flex flex-wrap items-center justify-end gap-2 sm:w-1/3'>
                                                        <div className='flex flex-wrap items-center gap-2'>
                                                                <TabButton label='شريك مراجعة' value='review' isActive={matchType === "review"} onClick={setMatchType} />
                                                                <TabButton label='مجموعة دراسة' value='group' isActive={matchType === "group"} onClick={setMatchType} />
                                                                <TabButton label='مساعدات مجانية' value='free' isActive={matchType === "free"} onClick={setMatchType} />
                                                        </div>
                                                        <button
                                                                type='button'
                                                                onClick={() => alert("Filters coming soon")}
                                                                className='flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                                                        >
                                                                فلتر
                                                        </button>
                                                </div>
                                        </div>

                                        <div className='mb-4 flex items-center justify-between text-xs text-slate-500 sm:text-sm'>
                                                <span>ترتيب حسب: الأعلى توافقًا أولًا</span>
                                        </div>

                                        <div className='space-y-4'>
                                                {errorMessage && <EmptyState message={errorMessage} />}
                                                {loadingMatches && <LoadingSpinner />}
                                                {!loadingMatches && !errorMessage && matches.length === 0 && (
                                                        <EmptyState message='لا توجد نتائج حالياً. جرّب مادة أخرى أو نوع مطابقة مختلف.' />
                                                )}
                                                {!loadingMatches && !errorMessage && matches.map((match) => <MatchCard key={match._id || match.id} match={match} />)}
                                        </div>
                                </section>
                        </div>
                </div>
        );
};

export default StudentSearchPage;
