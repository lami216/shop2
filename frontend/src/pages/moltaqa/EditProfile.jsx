import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import apiClient from "../../lib/apiClient";
import { useStudentProfileStore } from "../../stores/useStudentProfileStore";

const studyModeOptions = [
        { value: "online", label: "تعلم إلكتروني" },
        { value: "in-person", label: "حضوري" },
        { value: "review", label: "مراجعة" },
        { value: "group-study", label: "مذاكرة جماعية" },
];

const EditProfile = () => {
        const navigate = useNavigate();
        const { profile, loading, fetchMyProfile, saveProfile } = useStudentProfileStore();

        const [colleges, setColleges] = useState([]);
        const [majors, setMajors] = useState([]);
        const [subjects, setSubjects] = useState([]);
        const [lookupLoading, setLookupLoading] = useState(false);
        const [submitting, setSubmitting] = useState(false);

        const [formData, setFormData] = useState({
                college: "",
                major: "",
                level: "",
                subjects: [],
                studyModes: [],
                bio: "",
                availability: "",
                isVisible: true,
        });

        const selectedCollege = useMemo(() => formData.college, [formData.college]);
        const selectedMajor = useMemo(() => formData.major, [formData.major]);

        useEffect(() => {
                fetchMyProfile();
                loadColleges();
        }, [fetchMyProfile]);

        useEffect(() => {
                if (profile) {
                        setFormData((prev) => ({
                                ...prev,
                                college: profile.college?._id || "",
                                major: profile.major?._id || "",
                                level: profile.level || "",
                                subjects: profile.subjects?.map((s) => s._id || s) || [],
                                studyModes: profile.studyModes || [],
                                bio: profile.bio || "",
                                availability: profile.availability || "",
                                isVisible: profile.isVisible ?? true,
                        }));
                }
        }, [profile]);

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
                setLookupLoading(true);
                try {
                        const data = await apiClient.get("/api/moltaqa/colleges");
                        setColleges(data?.colleges || []);
                } catch (error) {
                        console.error("Failed to load colleges", error);
                } finally {
                        setLookupLoading(false);
                }
        };

        const loadMajors = async (collegeId) => {
                setLookupLoading(true);
                try {
                        const data = await apiClient.get(`/api/moltaqa/majors?college=${collegeId}`);
                        setMajors(data?.majors || []);
                } catch (error) {
                        console.error("Failed to load majors", error);
                } finally {
                        setLookupLoading(false);
                }
        };

        const loadSubjects = async (majorId) => {
                setLookupLoading(true);
                try {
                        const data = await apiClient.get(`/api/moltaqa/subjects?major=${majorId}`);
                        setSubjects(data?.subjects || []);
                } catch (error) {
                        console.error("Failed to load subjects", error);
                } finally {
                        setLookupLoading(false);
                }
        };

        const handleChange = (e) => {
                const { name, value, type, checked } = e.target;
                setFormData((prev) => ({
                        ...prev,
                        [name]: type === "checkbox" ? checked : value,
                }));
        };

        const handleSubjectToggle = (subjectId) => {
                setFormData((prev) => {
                        const exists = prev.subjects.includes(subjectId);
                        return {
                                ...prev,
                                subjects: exists
                                        ? prev.subjects.filter((id) => id !== subjectId)
                                        : [...prev.subjects, subjectId],
                        };
                });
        };

        const handleStudyModeToggle = (value) => {
                setFormData((prev) => {
                        const exists = prev.studyModes.includes(value);
                        return {
                                ...prev,
                                studyModes: exists
                                        ? prev.studyModes.filter((mode) => mode !== value)
                                        : [...prev.studyModes, value],
                        };
                });
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                setSubmitting(true);
                try {
                        await saveProfile({
                                ...formData,
                                level: formData.level ? Number(formData.level) : "",
                        });
                        navigate("/moltaqa/dashboard");
                } catch (error) {
                        console.error(error);
                } finally {
                        setSubmitting(false);
                }
        };

        if (loading && !profile) {
                return <LoadingSpinner />;
        }

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right'>
                        <div className='mb-8 flex items-center justify-between gap-4'>
                                <div>
                                        <p className='text-sm text-white/60'>تحديث الملف الدراسي</p>
                                        <h1 className='text-3xl font-bold text-white'>تعديل الملف الشخصي</h1>
                                </div>
                                <button
                                        onClick={() => navigate("/moltaqa/dashboard")}
                                        className='rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
                                >
                                        العودة للوحة الطالب
                                </button>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-6 rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                <div className='grid gap-6 md:grid-cols-2'>
                                        <div>
                                                <label className='mb-2 block text-sm font-semibold text-white'>الكلية</label>
                                                <select
                                                        name='college'
                                                        value={formData.college}
                                                        onChange={handleChange}
                                                        className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                >
                                                        <option value=''>اختر الكلية</option>
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
                                                        name='major'
                                                        value={formData.major}
                                                        onChange={handleChange}
                                                        className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                        disabled={!formData.college}
                                                >
                                                        <option value=''>اختر التخصص</option>
                                                        {majors.map((major) => (
                                                                <option key={major._id} value={major._id}>
                                                                        {major.name}
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>
                                        <div>
                                                <label className='mb-2 block text-sm font-semibold text-white'>المستوى</label>
                                                <select
                                                        name='level'
                                                        value={formData.level}
                                                        onChange={handleChange}
                                                        className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                >
                                                        <option value=''>اختر المستوى</option>
                                                        {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                                                                <option key={lvl} value={lvl}>
                                                                        المستوى {lvl}
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>
                                        <div>
                                                <label className='mb-2 block text-sm font-semibold text-white'>المواد</label>
                                                <div className='max-h-52 space-y-2 overflow-y-auto rounded-lg border border-white/20 bg-payzone-navy/40 p-3'>
                                                        {subjects.length === 0 && <p className='text-sm text-white/60'>اختر تخصصاً لعرض المواد</p>}
                                                        {subjects.map((subject) => (
                                                                <label key={subject._id} className='flex items-center justify-between rounded-md bg-white/5 px-3 py-2'>
                                                                        <span className='text-white'>{subject.name}</span>
                                                                        <input
                                                                                type='checkbox'
                                                                                checked={formData.subjects.includes(subject._id)}
                                                                                onChange={() => handleSubjectToggle(subject._id)}
                                                                                className='h-4 w-4 accent-payzone-gold'
                                                                        />
                                                                </label>
                                                        ))}
                                                </div>
                                        </div>
                                </div>

                                <div className='grid gap-6 md:grid-cols-2'>
                                        <div>
                                                <label className='mb-2 block text-sm font-semibold text-white'>أسلوب الدراسة</label>
                                                <div className='space-y-2 rounded-lg border border-white/20 bg-payzone-navy/40 p-3'>
                                                        {studyModeOptions.map((mode) => (
                                                                <label key={mode.value} className='flex items-center justify-between rounded-md bg-white/5 px-3 py-2'>
                                                                        <span className='text-white'>{mode.label}</span>
                                                                        <input
                                                                                type='checkbox'
                                                                                checked={formData.studyModes.includes(mode.value)}
                                                                                onChange={() => handleStudyModeToggle(mode.value)}
                                                                                className='h-4 w-4 accent-payzone-gold'
                                                                        />
                                                                </label>
                                                        ))}
                                                </div>
                                        </div>
                                        <div className='space-y-4'>
                                                <div>
                                                        <label className='mb-2 block text-sm font-semibold text-white'>نبذة عنك</label>
                                                        <textarea
                                                                name='bio'
                                                                value={formData.bio}
                                                                onChange={handleChange}
                                                                rows={4}
                                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                        ></textarea>
                                                </div>
                                                <div>
                                                        <label className='mb-2 block text-sm font-semibold text-white'>أوقات التفرغ</label>
                                                        <textarea
                                                                name='availability'
                                                                value={formData.availability}
                                                                onChange={handleChange}
                                                                rows={3}
                                                                className='w-full rounded-lg border border-white/20 bg-payzone-navy px-3 py-2 text-white focus:border-payzone-gold focus:outline-none'
                                                        ></textarea>
                                                </div>
                                                <label className='flex items-center justify-between rounded-lg bg-white/5 px-4 py-3'>
                                                        <div>
                                                                <p className='text-white font-semibold'>إظهار الملف للطلاب</p>
                                                                <p className='text-sm text-white/60'>اسمح لطلاب آخرين برؤية ملفك الدراسي</p>
                                                        </div>
                                                        <input
                                                                type='checkbox'
                                                                name='isVisible'
                                                                checked={formData.isVisible}
                                                                onChange={handleChange}
                                                                className='h-5 w-5 accent-payzone-gold'
                                                        />
                                                </label>
                                        </div>
                                </div>

                                <div className='flex flex-wrap items-center justify-between gap-4'>
                                        <div className='text-sm text-white/60'>
                                                {lookupLoading && <span className='mr-2 inline-block h-3 w-3 animate-ping rounded-full bg-payzone-gold'></span>}
                                                تأكد من تعبئة جميع الحقول المطلوبة لمطابقة أفضل.
                                        </div>
                                        <button
                                                type='submit'
                                                disabled={submitting}
                                                className='rounded-lg bg-payzone-gold px-6 py-2 text-sm font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d] disabled:cursor-not-allowed disabled:opacity-70'
                                        >
                                                {submitting ? "جارٍ الحفظ..." : "حفظ الملف"}
                                        </button>
                                </div>
                        </form>
                </div>
        );
};

export default EditProfile;
