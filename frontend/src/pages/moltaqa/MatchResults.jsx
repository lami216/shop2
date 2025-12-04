import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { useStudentProfileStore } from "../../stores/useStudentProfileStore";

const studyModeOptions = [
        { value: "online", label: "تعلم إلكتروني" },
        { value: "in-person", label: "حضوري" },
        { value: "review", label: "مراجعة" },
        { value: "group-study", label: "مذاكرة جماعية" },
];

const MatchResults = () => {
        const { matches, matchLoading, searchMatches } = useStudentProfileStore();
        const [colleges, setColleges] = useState([]);
        const [majors, setMajors] = useState([]);
        const [subjects, setSubjects] = useState([]);
        const [filters, setFilters] = useState({
                collegeId: "",
                majorId: "",
                subjectId: "",
                level: "",
                studyModes: [],
        });

        const selectedCollege = useMemo(() => filters.collegeId, [filters.collegeId]);
        const selectedMajor = useMemo(() => filters.majorId, [filters.majorId]);

        useEffect(() => {
                loadColleges();
                searchMatches({});
        }, [searchMatches]);

        useEffect(() => {
                if (selectedCollege) {
                        loadMajors(selectedCollege);
                } else {
                        setMajors([]);
                }
        }, [selectedCollege]);

        useEffect(() => {
                if (selectedMajor) {
                        loadSubjects(selectedMajor);
                } else {
                        setSubjects([]);
                }
        }, [selectedMajor]);

        const loadColleges = async () => {
                try {
                        const data = await apiClient.get("/api/moltaqa/colleges");
                        setColleges(data?.colleges || []);
                } catch (error) {
                        console.error("Failed to load colleges", error);
                }
        };

        const loadMajors = async (collegeId) => {
                try {
                        const data = await apiClient.get(`/api/moltaqa/majors?college=${collegeId}`);
                        setMajors(data?.majors || []);
                } catch (error) {
                        console.error("Failed to load majors", error);
                }
        };

        const loadSubjects = async (majorId) => {
                try {
                        const data = await apiClient.get(`/api/moltaqa/subjects?major=${majorId}`);
                        setSubjects(data?.subjects || []);
                } catch (error) {
                        console.error("Failed to load subjects", error);
                }
        };

        const handleChange = (e) => {
                const { name, value } = e.target;
                setFilters((prev) => ({ ...prev, [name]: value }));
        };

        const handleStudyModeToggle = (mode) => {
                setFilters((prev) => {
                        const exists = prev.studyModes.includes(mode);
                        return {
                                ...prev,
                                studyModes: exists
                                        ? prev.studyModes.filter((item) => item !== mode)
                                        : [...prev.studyModes, mode],
                        };
                });
        };

        const handleSearch = async (e) => {
                e.preventDefault();
                await searchMatches({
                        majorId: filters.majorId,
                        subjectId: filters.subjectId,
                        level: filters.level ? Number(filters.level) : "",
                        studyModes: filters.studyModes,
                });
        };

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right'>
                        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
                                <div>
                                        <p className='text-sm text-white/60'>نتائج مطابقة الطلاب</p>
                                        <h1 className='text-3xl font-bold text-white'>نتائج المطابقة</h1>
                                </div>
                                <Link
                                        to='/moltaqa/dashboard'
                                        className='rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
                                >
                                        العودة للوحة الطالب
                                </Link>
                        </div>

                        <form
                                onSubmit={handleSearch}
                                className='mb-8 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur md:grid-cols-2 lg:grid-cols-4'
                        >
                                <div>
                                        <label className='mb-2 block text-sm font-semibold text-white'>الكلية</label>
                                        <select
                                                name='collegeId'
                                                value={filters.collegeId}
                                                onChange={handleChange}
                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                        >
                                                <option value=''>كل الكليات</option>
                                                {colleges.map((college) => (
                                                        <option key={college._id} value={college._id}>
                                                                {college.name}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div>
                                        <label className='mb-2 block text-sm font-semibold text-white'>التخصص</label>
                                        <select
                                                name='majorId'
                                                value={filters.majorId}
                                                onChange={handleChange}
                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                disabled={!filters.collegeId}
                                        >
                                                <option value=''>كل التخصصات</option>
                                                {majors.map((major) => (
                                                        <option key={major._id} value={major._id}>
                                                                {major.name}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div>
                                        <label className='mb-2 block text-sm font-semibold text-white'>المادة</label>
                                        <select
                                                name='subjectId'
                                                value={filters.subjectId}
                                                onChange={handleChange}
                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                disabled={!filters.majorId}
                                        >
                                                <option value=''>كل المواد</option>
                                                {subjects.map((subject) => (
                                                        <option key={subject._id} value={subject._id}>
                                                                {subject.name}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div>
                                        <label className='mb-2 block text-sm font-semibold text-white'>المستوى</label>
                                        <select
                                                name='level'
                                                value={filters.level}
                                                onChange={handleChange}
                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                        >
                                                <option value=''>كل المستويات</option>
                                                {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                                                        <option key={lvl} value={lvl}>
                                                                المستوى {lvl}
                                                        </option>
                                                ))}
                                        </select>
                                </div>
                                <div className='md:col-span-2 lg:col-span-4'>
                                        <label className='mb-2 block text-sm font-semibold text-white'>أسلوب الدراسة</label>
                                        <div className='flex flex-wrap gap-3 rounded-lg border border-white/20 bg-payzone-navy/40 p-3'>
                                                {studyModeOptions.map((mode) => (
                                                        <button
                                                                key={mode.value}
                                                                type='button'
                                                                onClick={() => handleStudyModeToggle(mode.value)}
                                                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                                        filters.studyModes.includes(mode.value)
                                                                                ? "bg-payzone-gold text-payzone-navy"
                                                                                : "bg-white/10 text-white"
                                                                }`}
                                                        >
                                                                {mode.label}
                                                        </button>
                                                ))}
                                        </div>
                                </div>
                                <div className='md:col-span-2 lg:col-span-4 flex justify-end'>
                                        <button
                                                type='submit'
                                                className='rounded-lg bg-payzone-gold px-6 py-2 text-sm font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d]'
                                        >
                                                تنفيذ البحث
                                        </button>
                                </div>
                        </form>

                        <div className='space-y-4'>
                                {matchLoading && <p className='text-white/80'>جارٍ تحميل النتائج...</p>}
                                {!matchLoading && matches.length === 0 && (
                                        <p className='text-white/70'>لا توجد نتائج مطابقة حالياً. جرّب تعديل الفلاتر.</p>
                                )}
                                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {matches.map((match) => (
                                                <div key={match._id || match.userId} className='rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur'>
                                                        <div className='mb-3 flex items-center justify-between'>
                                                                <div>
                                                                        <h3 className='text-lg font-semibold text-white'>{match.name || match.studentName}</h3>
                                                                        <p className='text-sm text-white/60'>{match.college?.name || ""}</p>
                                                                </div>
                                                                <span className='rounded-full bg-payzone-gold px-3 py-1 text-xs font-semibold text-payzone-navy'>
                                                                        {Math.round(match.matchScore || 0)}%
                                                                </span>
                                                        </div>
                                                        <p className='text-sm text-white/80'>التخصص: {match.major?.name || "غير محدد"}</p>
                                                        <div className='mt-2'>
                                                                <p className='text-sm text-white/70'>المواد المشتركة:</p>
                                                                <div className='mt-1 flex flex-wrap gap-2'>
                                                                        {(match.subjects || []).map((subj) => (
                                                                                <span key={subj._id || subj} className='rounded-full bg-white/10 px-3 py-1 text-xs text-white'>
                                                                                        {subj.name || subj}
                                                                                </span>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                        <Link
                                                                to={`/moltaqa/student/${match.userId || match._id}`}
                                                                className='mt-4 inline-flex items-center justify-center rounded-lg bg-payzone-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3b3ad6]'
                                                        >
                                                                عرض الملف
                                                        </Link>
                                                </div>
                                        ))}
                                </div>
                        </div>
                </div>
        );
};

export default MatchResults;
