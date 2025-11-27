import { useEffect, useState } from "react";
import {
        createAdminCollege,
        createAdminMajor,
        createAdminSubject,
        fetchAdminColleges,
        fetchAdminMajors,
        fetchAdminSubjects,
} from "../../services/adminService";

const AdminAcademicsPage = () => {
        const [colleges, setColleges] = useState([]);
        const [majors, setMajors] = useState([]);
        const [subjects, setSubjects] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const [collegeName, setCollegeName] = useState("");
        const [majorName, setMajorName] = useState("");
        const [majorCollege, setMajorCollege] = useState("");
        const [subjectName, setSubjectName] = useState("");
        const [subjectMajor, setSubjectMajor] = useState("");
        const [subjectLevel, setSubjectLevel] = useState("");

        const loadAcademicData = async () => {
                try {
                        const [collegesData, majorsData, subjectsData] = await Promise.all([
                                fetchAdminColleges(),
                                fetchAdminMajors(),
                                fetchAdminSubjects(),
                        ]);
                        setColleges(collegesData || []);
                        setMajors(majorsData || []);
                        setSubjects(subjectsData || []);
                } catch (err) {
                        setError(err.message || "Failed to load academics");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                loadAcademicData();
        }, []);

        const handleCreateCollege = async (e) => {
                e.preventDefault();
                try {
                        await createAdminCollege({ collegeName });
                        setCollegeName("");
                        loadAcademicData();
                } catch (err) {
                        setError(err.message || "Failed to create college");
                }
        };

        const handleCreateMajor = async (e) => {
                e.preventDefault();
                try {
                        await createAdminMajor({ majorName, college: majorCollege });
                        setMajorName("");
                        setMajorCollege("");
                        loadAcademicData();
                } catch (err) {
                        setError(err.message || "Failed to create major");
                }
        };

        const handleCreateSubject = async (e) => {
                e.preventDefault();
                try {
                        await createAdminSubject({ subjectName, major: subjectMajor, level: subjectLevel });
                        setSubjectName("");
                        setSubjectMajor("");
                        setSubjectLevel("");
                        loadAcademicData();
                } catch (err) {
                        setError(err.message || "Failed to create subject");
                }
        };

        if (loading) return <p>Loading admin data...</p>;
        if (error) return <p className='text-red-400'>{error}</p>;

        return (
                <div className='space-y-6'>
                        <div className='grid gap-6 lg:grid-cols-3'>
                                <form onSubmit={handleCreateCollege} className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h3 className='text-lg font-semibold text-kingdom-cream'>Add College</h3>
                                        <input
                                                value={collegeName}
                                                onChange={(e) => setCollegeName(e.target.value)}
                                                placeholder='College Name'
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        />
                                        <button
                                                type='submit'
                                                className='mt-2 rounded bg-kingdom-gold px-3 py-1 text-sm font-semibold text-kingdom-charcoal'
                                        >
                                                Save
                                        </button>
                                </form>

                                <form onSubmit={handleCreateMajor} className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h3 className='text-lg font-semibold text-kingdom-cream'>Add Major</h3>
                                        <input
                                                value={majorName}
                                                onChange={(e) => setMajorName(e.target.value)}
                                                placeholder='Major Name'
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        />
                                        <select
                                                value={majorCollege}
                                                onChange={(e) => setMajorCollege(e.target.value)}
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        >
                                                <option value=''>Select College</option>
                                                {colleges.map((college) => (
                                                        <option key={college._id} value={college._id}>
                                                                {college.collegeName}
                                                        </option>
                                                ))}
                                        </select>
                                        <button
                                                type='submit'
                                                className='mt-2 rounded bg-kingdom-gold px-3 py-1 text-sm font-semibold text-kingdom-charcoal'
                                        >
                                                Save
                                        </button>
                                </form>

                                <form onSubmit={handleCreateSubject} className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h3 className='text-lg font-semibold text-kingdom-cream'>Add Subject</h3>
                                        <input
                                                value={subjectName}
                                                onChange={(e) => setSubjectName(e.target.value)}
                                                placeholder='Subject Name'
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        />
                                        <select
                                                value={subjectMajor}
                                                onChange={(e) => setSubjectMajor(e.target.value)}
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        >
                                                <option value=''>Select Major</option>
                                                {majors.map((major) => (
                                                        <option key={major._id} value={major._id}>
                                                                {major.majorName}
                                                        </option>
                                                ))}
                                        </select>
                                        <input
                                                value={subjectLevel}
                                                onChange={(e) => setSubjectLevel(e.target.value)}
                                                placeholder='Level (optional)'
                                                className='mt-2 w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                        />
                                        <button
                                                type='submit'
                                                className='mt-2 rounded bg-kingdom-gold px-3 py-1 text-sm font-semibold text-kingdom-charcoal'
                                        >
                                                Save
                                        </button>
                                </form>
                        </div>

                        <div className='grid gap-6 lg:grid-cols-3'>
                                <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h4 className='mb-2 text-lg font-semibold text-kingdom-cream'>Colleges</h4>
                                        <ul className='space-y-1 text-sm text-kingdom-cream/80'>
                                                {colleges.length === 0 && <li>No records found</li>}
                                                {colleges.map((college) => (
                                                        <li key={college._id}>{college.collegeName}</li>
                                                ))}
                                        </ul>
                                </div>
                                <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h4 className='mb-2 text-lg font-semibold text-kingdom-cream'>Majors</h4>
                                        <ul className='space-y-1 text-sm text-kingdom-cream/80'>
                                                {majors.length === 0 && <li>No records found</li>}
                                                {majors.map((major) => (
                                                        <li key={major._id}>
                                                                {major.majorName} {major.college ? `(${major.college.collegeName})` : ""}
                                                        </li>
                                                ))}
                                        </ul>
                                </div>
                                <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                        <h4 className='mb-2 text-lg font-semibold text-kingdom-cream'>Subjects</h4>
                                        <ul className='space-y-1 text-sm text-kingdom-cream/80'>
                                                {subjects.length === 0 && <li>No records found</li>}
                                                {subjects.map((subject) => (
                                                        <li key={subject._id}>
                                                                {subject.subjectName} {subject.major ? `- ${subject.major.majorName}` : ""} {subject.level ? `(${subject.level})` : ""}
                                                        </li>
                                                ))}
                                        </ul>
                                </div>
                        </div>
                        {/* TODO: add validations to prevent inconsistent data */}
                </div>
        );
};

export default AdminAcademicsPage;
