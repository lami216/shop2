import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useStudentProfileStore } from "../../stores/useStudentProfileStore";

const StudentDashboard = () => {
        const navigate = useNavigate();
        const { profile, loading, fetchMyProfile, saveProfile } = useStudentProfileStore();

        useEffect(() => {
                fetchMyProfile();
        }, [fetchMyProfile]);

        const handleToggleVisibility = () => {
                if (!profile) return;
                saveProfile({ isVisible: !profile.isVisible });
        };

        if (loading && !profile) {
                return <LoadingSpinner />;
        }

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right'>
                        <div className='mb-8 flex items-center justify-between gap-4'>
                                <div>
                                        <p className='text-sm text-white/60'>ملتقى الطلاب</p>
                                        <h1 className='text-3xl font-bold text-white'>لوحة الطالب – ملتقى</h1>
                                </div>
                                <button
                                        onClick={() => navigate("/moltaqa/profile/edit")}
                                        className='rounded-lg bg-payzone-gold px-4 py-2 text-sm font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d]'
                                >
                                        تعديل الملف الشخصي
                                </button>
                        </div>

                        {profile ? (
                                <div className='grid gap-6 lg:grid-cols-3'>
                                        <div className='lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                                <div className='mb-4 flex items-center justify-between gap-4'>
                                                        <h2 className='text-xl font-semibold text-white'>ملخص الملف الدراسي</h2>
                                                        <Link
                                                                to='/moltaqa/matches'
                                                                className='rounded-lg bg-payzone-indigo px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-[#3b3ad6]'
                                                        >
                                                                عرض نتائج المطابقة
                                                        </Link>
                                                </div>
                                                <div className='space-y-3 text-white/90'>
                                                        <div className='flex items-center justify-between rounded-lg bg-white/5 p-3'>
                                                                <span className='text-white/70'>الكلية</span>
                                                                <span className='font-semibold'>{profile.college?.name || "غير محدد"}</span>
                                                        </div>
                                                        <div className='flex items-center justify-between rounded-lg bg-white/5 p-3'>
                                                                <span className='text-white/70'>التخصص</span>
                                                                <span className='font-semibold'>{profile.major?.name || "غير محدد"}</span>
                                                        </div>
                                                        <div className='flex items-center justify-between rounded-lg bg-white/5 p-3'>
                                                                <span className='text-white/70'>المستوى</span>
                                                                <span className='font-semibold'>{profile.level || "غير محدد"}</span>
                                                        </div>
                                                </div>
                                        </div>
                                        <div className='space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                                <div className='flex items-center justify-between'>
                                                        <div>
                                                                <h3 className='text-lg font-semibold text-white'>ظهور الملف</h3>
                                                                <p className='text-sm text-white/60'>تحكم في إمكانية رؤيتك لطلاب آخرين</p>
                                                        </div>
                                                        <label className='inline-flex cursor-pointer items-center'>
                                                                <input
                                                                        type='checkbox'
                                                                        className='peer sr-only'
                                                                        checked={!!profile.isVisible}
                                                                        onChange={handleToggleVisibility}
                                                                />
                                                                <div className='relative h-6 w-12 rounded-full bg-white/30 transition peer-checked:bg-payzone-gold'>
                                                                        <span className='absolute left-1 top-1 h-4 w-4 rounded-full bg-payzone-navy transition peer-checked:translate-x-6 peer-checked:bg-payzone-navy'></span>
                                                                </div>
                                                        </label>
                                                </div>
                                                <div className='rounded-lg bg-white/5 p-4 text-sm text-white/80'>
                                                        <p>
                                                                عند تفعيل ظهور الملف، يمكن للطلاب الآخرين العثور عليك بناءً على التخصص والمقررات المشتركة.
                                                        </p>
                                                </div>
                                                <button
                                                        onClick={() => navigate("/moltaqa/matches")}
                                                        className='w-full rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
                                                >
                                                        عرض نتائج المطابقة
                                                </button>
                                        </div>
                                </div>
                        ) : (
                                <div className='rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center shadow-xl backdrop-blur'>
                                        <h2 className='mb-3 text-2xl font-semibold text-white'>الرجاء إنشاء ملفك الدراسي</h2>
                                        <p className='mb-6 text-white/70'>ابدأ بتعبئة بياناتك الدراسية للتواصل مع زملاء يناسبون أسلوب دراستك.</p>
                                        <button
                                                onClick={() => navigate("/moltaqa/profile/edit")}
                                                className='rounded-lg bg-payzone-gold px-5 py-2 text-sm font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d]'
                                        >
                                                إنشاء الملف الشخصي
                                        </button>
                                </div>
                        )}
                </div>
        );
};

export default StudentDashboard;
