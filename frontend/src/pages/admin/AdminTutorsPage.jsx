import { useEffect, useState } from "react";

import ErrorBox from "../../components/ui/ErrorBox";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { fetchAdminTutorDetail, fetchAdminTutors } from "../../services/adminService";

const AdminTutorsPage = () => {
        const [tutors, setTutors] = useState([]);
        const [selectedTutor, setSelectedTutor] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const loadTutors = async () => {
                try {
                        const data = await fetchAdminTutors();
                        setTutors(data || []);
                } catch (err) {
                        setError(err.message || "Failed to load tutors");
                } finally {
                        setLoading(false);
                }
        };

        const loadTutorDetail = async (id) => {
                try {
                        const detail = await fetchAdminTutorDetail(id);
                        setSelectedTutor(detail);
                } catch (err) {
                        setError(err.message || "Failed to load tutor detail");
                }
        };

        useEffect(() => {
                loadTutors();
        }, []);

        if (loading) return <LoadingSpinner label='Loading tutors...' />;
        if (error) return <ErrorBox message={error} onRetry={loadTutors} />;

        return (
                <div className='grid gap-4 lg:grid-cols-3'>
                        <div className='lg:col-span-2'>
                                <h2 className='mb-3 text-xl font-semibold text-kingdom-cream'>Tutors</h2>
                                <div className='overflow-x-auto'>
                                        <table className='min-w-full divide-y divide-kingdom-gold/20'>
                                                <thead className='bg-kingdom-purple/40 text-left text-sm uppercase text-kingdom-cream/70'>
                                                        <tr>
                                                                <th className='px-3 py-2'>Name</th>
                                                                <th className='px-3 py-2'>Email</th>
                                                                <th className='px-3 py-2'>Badge</th>
                                                                <th className='px-3 py-2'>Income (Month)</th>
                                                                <th className='px-3 py-2'>Income (Total)</th>
                                                                <th className='px-3 py-2'>Lessons</th>
                                                        </tr>
                                                </thead>
                                                <tbody className='divide-y divide-kingdom-gold/10 text-sm'>
                                                        {tutors.length === 0 && (
                                                                <tr>
                                                                        <td className='px-3 py-3' colSpan={6}>
                                                                                No records found
                                                                        </td>
                                                                </tr>
                                                        )}
                                                        {tutors.map((tutor) => (
                                                                <tr
                                                                        key={tutor._id}
                                                                        className='cursor-pointer hover:bg-kingdom-purple/10'
                                                                        onClick={() => loadTutorDetail(tutor._id)}
                                                                >
                                                                        <td className='px-3 py-2'>{tutor.name}</td>
                                                                        <td className='px-3 py-2'>{tutor.email}</td>
                                                                        <td className='px-3 py-2 capitalize'>{tutor.badge?.name || "-"}</td>
                                                                        <td className='px-3 py-2'>{tutor.incomeMonth || 0}</td>
                                                                        <td className='px-3 py-2'>{tutor.incomeTotal || 0}</td>
                                                                        <td className='px-3 py-2'>{tutor.activeLessons}</td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>
                                </div>
                        </div>

                        <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                <h3 className='text-lg font-semibold text-kingdom-cream'>Tutor Details</h3>
                                {!selectedTutor && <p className='text-sm text-kingdom-cream/70'>Select a tutor to view details.</p>}
                                {selectedTutor && (
                                        <div className='space-y-2 text-sm text-kingdom-cream/80'>
                                                <p className='text-lg font-semibold text-kingdom-gold'>{selectedTutor.userId?.name}</p>
                                                <p>{selectedTutor.userId?.email}</p>
                                                <p className='capitalize'>Badge: {selectedTutor.teacherBadge?.name || "-"}</p>
                                                <p>Income Month: {selectedTutor.incomeMonth || 0}</p>
                                                <p>Income Total: {selectedTutor.incomeTotal || 0}</p>
                                                <div>
                                                        <p className='font-semibold text-kingdom-cream'>Specialties</p>
                                                        <ul className='list-disc pl-4'>
                                                                {(selectedTutor.specialties || []).map((item) => (
                                                                        <li key={item._id}>{item.majorName}</li>
                                                                ))}
                                                        </ul>
                                                </div>
                                                <div>
                                                        <p className='font-semibold text-kingdom-cream'>Subjects</p>
                                                        <ul className='list-disc pl-4'>
                                                                {(selectedTutor.subjects || []).map((subject) => (
                                                                        <li key={subject._id}>
                                                                                {subject.subjectName} {subject.level ? `(${subject.level})` : ""}
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                </div>
                                                <div>
                                                        <p className='font-semibold text-kingdom-cream'>Subject Pricing</p>
                                                        <ul className='list-disc pl-4'>
                                                                {(selectedTutor.subjectPricing || []).map((pricing, idx) => (
                                                                        <li key={pricing._id || idx}>
                                                                                {pricing.subject?.subjectName || "Subject"}: {pricing.monthly || 0} / {pricing.semester || 0}
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                </div>
                                                {/* TODO: support manual badge overrides later */}
                                        </div>
                                )}
                        </div>
                </div>
        );
};

export default AdminTutorsPage;
