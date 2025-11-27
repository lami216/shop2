import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { apiClient } from "../lib/apiClient";
import { useUserStore } from "../stores/useUserStore";

const LEVEL_OPTIONS = [
        { value: "L1", label: "Level 1" },
        { value: "L2", label: "Level 2" },
        { value: "L3", label: "Level 3" },
        { value: "Master", label: "Master" },
];

const emptyProfileState = {
        specialtiesText: "",
        subjectsText: "",
        levels: [],
        pricingMonthly: "",
        pricingSemester: "",
        bankNumber: "",
        subjectPricing: [],
};

const TutorProfilePage = () => {
        const user = useUserStore((state) => state.user);
        const [profile, setProfile] = useState(null);
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);
        const [formState, setFormState] = useState(emptyProfileState);

        const badgeLabel = useMemo(() => profile?.teacherBadge?.name || profile?.teacherBadge?.label, [profile]);

        const parseListInput = (value = "") =>
                value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);

        const fetchProfile = async () => {
                setLoading(true);
                try {
                        const data = await apiClient.get("/tutor/profile");
                        setProfile(data);

                        if (data) {
                                setFormState({
                                        specialtiesText: Array.isArray(data.specialties)
                                                ? data.specialties.map((m) => m?._id || m).join(", ")
                                                : "",
                                        subjectsText: Array.isArray(data.subjects)
                                                ? data.subjects.map((s) => s?._id || s).join(", ")
                                                : "",
                                        levels: data.levels || [],
                                        pricingMonthly: data.pricingMonthly || "",
                                        pricingSemester: data.pricingSemester || "",
                                        bankNumber: data.bankNumber || "",
                                        subjectPricing: data.subjectPricing?.length
                                                ? data.subjectPricing.map((item) => ({
                                                          subject: item.subject?._id || item.subject || "",
                                                          monthly: item.monthly || "",
                                                          semester: item.semester || "",
                                                  }))
                                                : [],
                                });
                        } else {
                                setFormState(emptyProfileState);
                        }
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Failed to load tutor profile");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                fetchProfile();
        }, []);

        const toggleLevel = (levelValue) => {
                setFormState((prev) => {
                        const exists = prev.levels.includes(levelValue);
                        const levels = exists
                                ? prev.levels.filter((lvl) => lvl !== levelValue)
                                : [...prev.levels, levelValue];

                        return { ...prev, levels };
                });
        };

        const updateSubjectPricingRow = (index, key, value) => {
                setFormState((prev) => {
                        const rows = [...prev.subjectPricing];
                        rows[index] = { ...rows[index], [key]: value };
                        return { ...prev, subjectPricing: rows };
                });
        };

        const addSubjectPricingRow = () => {
                setFormState((prev) => ({
                        ...prev,
                        subjectPricing: [...prev.subjectPricing, { subject: "", monthly: "", semester: "" }],
                }));
        };

        const removeSubjectPricingRow = (index) => {
                setFormState((prev) => ({
                        ...prev,
                        subjectPricing: prev.subjectPricing.filter((_, idx) => idx !== index),
                }));
        };

        const handleSave = async () => {
                setSaving(true);

                const payload = {
                        specialties: parseListInput(formState.specialtiesText),
                        subjects: parseListInput(formState.subjectsText),
                        levels: formState.levels,
                        pricingMonthly: formState.pricingMonthly ? Number(formState.pricingMonthly) : undefined,
                        pricingSemester: formState.pricingSemester ? Number(formState.pricingSemester) : undefined,
                        bankNumber: formState.bankNumber,
                        subjectPricing: (formState.subjectPricing || [])
                                .filter((row) => row.subject)
                                .map((row) => ({
                                        subject: row.subject,
                                        monthly: row.monthly ? Number(row.monthly) : undefined,
                                        semester: row.semester ? Number(row.semester) : undefined,
                                })),
                };

                try {
                        const method = profile ? apiClient.put : apiClient.post;
                        const data = await method("/tutor/profile", payload);
                        toast.success("Profile saved");
                        setProfile(data);
                        setFormState((prev) => ({
                                ...prev,
                                subjectPricing: data.subjectPricing?.map((row) => ({
                                        subject: row.subject?._id || row.subject || "",
                                        monthly: row.monthly || "",
                                        semester: row.semester || "",
                                })) || prev.subjectPricing,
                        }));
                } catch (error) {
                        console.error(error);
                        toast.error(error.response?.data?.message || "Failed to save profile");
                } finally {
                        setSaving(false);
                }
        };

        return (
                <div className='relative min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-24 sm:px-6 lg:px-8'>
                                <div className='flex flex-col gap-2'>
                                        <h1 className='text-4xl font-bold text-kingdom-gold'>ملف المعلم - ملتقى Moltaqa</h1>
                                        <p className='text-kingdom-cream/70'>
                                                قم بتحديث بيانات التدريس والأسعار الخاصة بك. TODO: تحسين عرض الشارات والألوان وربط التخصصات والمواد بقوائم حقيقية.
                                        </p>
                                </div>

                                <div className='grid gap-6 lg:grid-cols-3'>
                                        <div className='rounded-2xl border border-kingdom-gold/30 bg-black/50 p-4 shadow-royal-soft lg:col-span-2'>
                                                <div className='mb-4 flex items-center justify-between'>
                                                        <div>
                                                                <h2 className='text-2xl font-semibold text-kingdom-gold'>البيانات الأساسية</h2>
                                                                <p className='text-sm text-kingdom-cream/60'>تأكد من دقة معلومات المواد والمستويات.</p>
                                                        </div>
                                                        {badgeLabel && (
                                                                <span className='rounded-full border border-kingdom-gold/40 px-3 py-1 text-xs uppercase tracking-wide text-kingdom-gold'>
                                                                        Badge {badgeLabel}
                                                                </span>
                                                        )}
                                                </div>

                                                <div className='grid gap-4 sm:grid-cols-2'>
                                                        <label className='flex flex-col gap-2'>
                                                                <span className='text-sm text-kingdom-cream/80'>التخصصات</span>
                                                                <textarea
                                                                        className='min-h-[70px] rounded-xl border border-kingdom-gold/30 bg-kingdom-charcoal/50 p-3 text-sm text-white'
                                                                        placeholder='Comma separated major IDs (TODO: replace with majors list)'
                                                                        value={formState.specialtiesText}
                                                                        onChange={(e) => setFormState({ ...formState, specialtiesText: e.target.value })}
                                                                />
                                                        </label>
                                                        <label className='flex flex-col gap-2'>
                                                                <span className='text-sm text-kingdom-cream/80'>المواد</span>
                                                                <textarea
                                                                        className='min-h-[70px] rounded-xl border border-kingdom-gold/30 bg-kingdom-charcoal/50 p-3 text-sm text-white'
                                                                        placeholder='Comma separated subject IDs (TODO: bind to catalog)'
                                                                        value={formState.subjectsText}
                                                                        onChange={(e) => setFormState({ ...formState, subjectsText: e.target.value })}
                                                                />
                                                        </label>
                                                        <div className='flex flex-col gap-2'>
                                                                <span className='text-sm text-kingdom-cream/80'>المستويات التعليمية</span>
                                                                <div className='grid grid-cols-2 gap-2'>
                                                                        {LEVEL_OPTIONS.map((option) => (
                                                                                <label
                                                                                        key={option.value}
                                                                                        className='flex items-center gap-2 rounded-lg border border-kingdom-gold/20 bg-kingdom-charcoal/40 px-3 py-2 text-sm text-kingdom-cream/90'
                                                                                >
                                                                                        <input
                                                                                                type='checkbox'
                                                                                                checked={formState.levels.includes(option.value)}
                                                                                                onChange={() => toggleLevel(option.value)}
                                                                                                className='accent-kingdom-gold'
                                                                                        />
                                                                                        <span>{option.label}</span>
                                                                                </label>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                        <label className='flex flex-col gap-2'>
                                                                <span className='text-sm text-kingdom-cream/80'>رقم الحساب البنكي</span>
                                                                <input
                                                                        className='rounded-xl border border-kingdom-gold/30 bg-kingdom-charcoal/50 p-3 text-sm text-white'
                                                                        value={formState.bankNumber}
                                                                        onChange={(e) => setFormState({ ...formState, bankNumber: e.target.value })}
                                                                        placeholder='IBAN or account number'
                                                                />
                                                        </label>
                                                        <div className='grid grid-cols-2 gap-3 rounded-xl border border-kingdom-gold/20 bg-kingdom-charcoal/30 p-3'>
                                                                <label className='flex flex-col gap-1 text-sm'>
                                                                        <span className='text-kingdom-cream/80'>سعر شهري عام</span>
                                                                        <input
                                                                                type='number'
                                                                                className='rounded-lg border border-kingdom-gold/30 bg-black/40 p-2 text-white'
                                                                                value={formState.pricingMonthly}
                                                                                onChange={(e) => setFormState({ ...formState, pricingMonthly: e.target.value })}
                                                                                placeholder='مثال: 250'
                                                                        />
                                                                </label>
                                                                <label className='flex flex-col gap-1 text-sm'>
                                                                        <span className='text-kingdom-cream/80'>سعر فصلي عام</span>
                                                                        <input
                                                                                type='number'
                                                                                className='rounded-lg border border-kingdom-gold/30 bg-black/40 p-2 text-white'
                                                                                value={formState.pricingSemester}
                                                                                onChange={(e) => setFormState({ ...formState, pricingSemester: e.target.value })}
                                                                                placeholder='مثال: 800'
                                                                        />
                                                                </label>
                                                                <p className='col-span-2 text-xs text-kingdom-cream/60'>
                                                                        TODO: سيتم الاعتماد على الأسعار لكل مادة بشكل أساسي لاحقًا، مع بقاء هذه القيم كافتراضية.
                                                                </p>
                                                        </div>
                                                </div>

                                                <div className='mt-6 rounded-2xl border border-kingdom-gold/30 bg-kingdom-charcoal/30 p-4'>
                                                        <div className='mb-3 flex items-center justify-between'>
                                                                <h3 className='text-xl font-semibold text-kingdom-gold'>أسعار لكل مادة</h3>
                                                                <button
                                                                        onClick={addSubjectPricingRow}
                                                                        className='rounded-lg border border-kingdom-gold/40 px-3 py-2 text-sm text-kingdom-gold transition-royal hover:bg-kingdom-purple/40'
                                                                >
                                                                        إضافة مادة
                                                                </button>
                                                        </div>
                                                        <div className='flex flex-col gap-3'>
                                                                {formState.subjectPricing.length === 0 && (
                                                                        <p className='text-sm text-kingdom-cream/60'>لا توجد أسعار محددة بعد. أضف مادة لتحديد السعر.</p>
                                                                )}
                                                                {formState.subjectPricing.map((row, index) => (
                                                                        <div
                                                                                key={index}
                                                                                className='grid gap-3 rounded-xl border border-kingdom-gold/20 bg-black/40 p-3 sm:grid-cols-4'
                                                                        >
                                                                                <div className='sm:col-span-2'>
                                                                                        <label className='flex flex-col gap-1 text-sm'>
                                                                                                <span className='text-kingdom-cream/80'>المادة</span>
                                                                                                <input
                                                                                                        className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                                                        value={row.subject}
                                                                                                        onChange={(e) => updateSubjectPricingRow(index, "subject", e.target.value)}
                                                                                                        placeholder='Subject ID (TODO: استبدال بالقائمة)'
                                                                                                />
                                                                                        </label>
                                                                                </div>
                                                                                <label className='flex flex-col gap-1 text-sm'>
                                                                                        <span className='text-kingdom-cream/80'>سعر شهري</span>
                                                                                        <input
                                                                                                type='number'
                                                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                                                value={row.monthly}
                                                                                                onChange={(e) => updateSubjectPricingRow(index, "monthly", e.target.value)}
                                                                                                placeholder='مثال: 300'
                                                                                        />
                                                                                </label>
                                                                                <label className='flex flex-col gap-1 text-sm'>
                                                                                        <span className='text-kingdom-cream/80'>سعر فصلي</span>
                                                                                        <input
                                                                                                type='number'
                                                                                                className='rounded-lg border border-kingdom-gold/30 bg-kingdom-charcoal/40 p-2 text-white'
                                                                                                value={row.semester}
                                                                                                onChange={(e) => updateSubjectPricingRow(index, "semester", e.target.value)}
                                                                                                placeholder='مثال: 900'
                                                                                        />
                                                                                </label>
                                                                                <div className='flex items-end justify-end'>
                                                                                        <button
                                                                                                onClick={() => removeSubjectPricingRow(index)}
                                                                                                className='rounded-md border border-red-400/40 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20'
                                                                                        >
                                                                                                إزالة
                                                                                        </button>
                                                                                </div>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                        <p className='mt-3 text-xs text-kingdom-cream/60'>TODO: التحقق من أن المادة والسعر متوافقان مع التخصص والمستوى.</p>
                                                </div>

                                                <div className='mt-6 flex justify-end'>
                                                        <button
                                                                disabled={saving}
                                                                onClick={handleSave}
                                                                className='rounded-xl bg-kingdom-gold px-6 py-3 text-sm font-semibold text-kingdom-charcoal shadow-royal-soft transition-royal hover:shadow-royal-glow disabled:opacity-60'
                                                        >
                                                                {saving ? "جاري الحفظ..." : "حفظ الملف"}
                                                        </button>
                                                </div>
                                        </div>

                                        <aside className='flex flex-col gap-4 rounded-2xl border border-kingdom-gold/30 bg-black/60 p-4 shadow-royal-soft'>
                                                <div className='rounded-xl border border-kingdom-gold/20 bg-kingdom-charcoal/30 p-3'>
                                                        <h3 className='text-lg font-semibold text-kingdom-gold'>المعلم</h3>
                                                        {user ? (
                                                                <div className='mt-2 space-y-1 text-sm text-kingdom-cream/80'>
                                                                        <p>الاسم: {user.name}</p>
                                                                        <p>البريد: {user.email}</p>
                                                                        <p>الدور: {user.role}</p>
                                                                </div>
                                                        ) : (
                                                                <p className='text-sm text-kingdom-cream/60'>يجب تسجيل الدخول لعرض بياناتك.</p>
                                                        )}
                                                </div>

                                                <div className='rounded-xl border border-kingdom-gold/20 bg-kingdom-charcoal/30 p-3'>
                                                        <h3 className='text-lg font-semibold text-kingdom-gold'>الدخل</h3>
                                                        <p className='text-sm text-kingdom-cream/60'>سيتم احتساب الدخل من مدفوعات مؤكدة في الخطوات القادمة.</p>
                                                        <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                                                                <div className='rounded-lg border border-kingdom-gold/30 bg-black/40 p-3'>
                                                                        <p className='text-kingdom-cream/60'>دخل الشهر الحالي</p>
                                                                        <p className='text-xl font-semibold text-kingdom-gold'>
                                                                                {profile?.incomeMonth ?? 0}
                                                                        </p>
                                                                </div>
                                                                <div className='rounded-lg border border-kingdom-gold/30 bg-black/40 p-3'>
                                                                        <p className='text-kingdom-cream/60'>الدخل الكلي</p>
                                                                        <p className='text-xl font-semibold text-kingdom-gold'>
                                                                                {profile?.incomeTotal ?? 0}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                        <p className='mt-2 text-xs text-kingdom-cream/60'>TODO: تحديث الأرقام مباشرة من سجلات الدفعات المؤكدة.</p>
                                                </div>
                                        </aside>
                                </div>

                                {loading && <p className='text-sm text-kingdom-cream/70'>جاري تحميل الملف...</p>}
                        </div>
                </div>
        );
};

export default TutorProfilePage;
