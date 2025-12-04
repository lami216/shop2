import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { usePublicProfileStore } from "../../stores/usePublicProfileStore";

const studyModeLabels = {
        online: "تعلم إلكتروني",
        "in-person": "حضوري",
        review: "مراجعة",
        "group-study": "مذاكرة جماعية",
};

const PublicStudentProfile = () => {
        const { userId } = useParams();
        const { profile, loading, error, fetchPublicProfile } = usePublicProfileStore();

        useEffect(() => {
                if (userId) {
                        fetchPublicProfile(userId);
                }
        }, [fetchPublicProfile, userId]);

        if (loading) {
                return <LoadingSpinner />;
        }

        if (!profile || profile.isVisible === false || error) {
                return (
                        <div className='container mx-auto px-4 pb-16 pt-24 text-center text-white'>
                                <h1 className='text-2xl font-bold'>الملف غير متاح</h1>
                        </div>
                );
        }

        const subjects = profile.subjects || [];
        const studyModes = profile.studyModes || [];

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right text-white'>
                        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                                <div>
                                        <p className='text-sm text-white/60'>ملف طالب – ملتقى</p>
                                        <h1 className='text-3xl font-bold'>{profile.user?.name || "طالب"}</h1>
                                        <p className='text-white/70'>{profile.major?.name || "تخصص غير محدد"}</p>
                                </div>
                                <button
                                        onClick={() => console.log("Messaging coming soon")}
                                        className='self-start rounded-lg bg-payzone-gold px-5 py-2 text-sm font-semibold text-payzone-navy shadow-lg transition duration-300 hover:bg-[#b8873d]'
                                >
                                        بدء محادثة
                                </button>
                        </div>

                        <div className='grid gap-6 lg:grid-cols-3'>
                                <div className='space-y-6 lg:col-span-2'>
                                        <div className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                                <h2 className='mb-4 text-xl font-semibold text-white'>معلومات أساسية</h2>
                                                <div className='grid gap-4 md:grid-cols-2'>
                                                        <div className='rounded-lg bg-white/5 p-4'>
                                                                <p className='text-sm text-white/60'>الكلية</p>
                                                                <p className='text-lg font-semibold'>{profile.college?.name || "غير محدد"}</p>
                                                        </div>
                                                        <div className='rounded-lg bg-white/5 p-4'>
                                                                <p className='text-sm text-white/60'>المستوى</p>
                                                                <p className='text-lg font-semibold'>{profile.level || "غير محدد"}</p>
                                                        </div>
                                                        <div className='rounded-lg bg-white/5 p-4 md:col-span-2'>
                                                                <p className='text-sm text-white/60'>المواد</p>
                                                                <div className='mt-2 flex flex-wrap gap-2'>
                                                                        {subjects.length > 0 ? (
                                                                                subjects.map((subject) => (
                                                                                        <span
                                                                                                key={subject._id || subject.name}
                                                                                                className='rounded-full bg-white/10 px-3 py-1 text-xs text-white'
                                                                                        >
                                                                                                {subject.name || subject}
                                                                                        </span>
                                                                                ))
                                                                        ) : (
                                                                                <span className='text-sm text-white/50'>لا توجد مواد مضافة</span>
                                                                        )}
                                                                </div>
                                                        </div>
                                                        <div className='rounded-lg bg-white/5 p-4 md:col-span-2'>
                                                                <p className='text-sm text-white/60'>أسلوب الدراسة</p>
                                                                <div className='mt-2 flex flex-wrap gap-2'>
                                                                        {studyModes.length > 0 ? (
                                                                                studyModes.map((mode) => (
                                                                                        <span
                                                                                                key={mode}
                                                                                                className='rounded-full bg-payzone-indigo/80 px-3 py-1 text-xs font-semibold text-white'
                                                                                        >
                                                                                                {studyModeLabels[mode] || mode}
                                                                                        </span>
                                                                                ))
                                                                        ) : (
                                                                                <span className='text-sm text-white/50'>لم يتم تحديد أسلوب الدراسة</span>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>

                                        <div className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                                <h2 className='mb-4 text-xl font-semibold text-white'>نبذة</h2>
                                                <p className='text-white/80'>{profile.bio || "لا توجد نبذة مضافة بعد."}</p>
                                        </div>
                                </div>

                                <div className='space-y-6'>
                                        <div className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur'>
                                                <h2 className='mb-4 text-xl font-semibold text-white'>التوفر</h2>
                                                <p className='text-white/80'>{profile.availability || "لم يحدد الطالب أوقات التوفر."}</p>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default PublicStudentProfile;
