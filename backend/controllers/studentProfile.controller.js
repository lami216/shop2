import StudentProfile from "../models/studentProfile.model.js";
import College from "../models/college.model.js";
import Major from "../models/major.model.js";
import Subject from "../models/subject.model.js";

const populateProfile = (query) =>
        query
                .populate({ path: "user", select: "name email" })
                .populate({ path: "college", select: "name shortName" })
                .populate({ path: "major", select: "name code" })
                .populate({ path: "subjects", select: "name code level" });

export const createOrUpdateStudentProfile = async (req, res) => {
        try {
                const userId = req.user?._id;
                const { college, major, level, subjects, bio, studyModes, availability, isVisible } = req.body || {};

                const updateData = {};

                if (college !== undefined) {
                        if (college !== null) {
                                const collegeExists = await College.exists({ _id: college });
                                if (!collegeExists) {
                                        return res.status(400).json({ message: "Invalid input" });
                                }
                        }
                        updateData.college = college;
                }

                if (major !== undefined) {
                        if (major !== null) {
                                const majorExists = await Major.exists({ _id: major });
                                if (!majorExists) {
                                        return res.status(400).json({ message: "Invalid input" });
                                }
                        }
                        updateData.major = major;
                }

                if (level !== undefined) {
                        const numericLevel = Number(level);
                        if (!Number.isFinite(numericLevel)) {
                                return res.status(400).json({ message: "Invalid input" });
                        }
                        updateData.level = numericLevel;
                }

                if (subjects !== undefined) {
                        if (!Array.isArray(subjects)) {
                                return res.status(400).json({ message: "Invalid input" });
                        }
                        if (subjects.length > 0) {
                                const subjectCount = await Subject.countDocuments({ _id: { $in: subjects } });
                                if (subjectCount !== subjects.length) {
                                        return res.status(400).json({ message: "Invalid input" });
                                }
                        }
                        updateData.subjects = subjects;
                }

                if (studyModes !== undefined) {
                        if (!Array.isArray(studyModes)) {
                                return res.status(400).json({ message: "Invalid input" });
                        }
                        updateData.studyModes = studyModes;
                }

                if (bio !== undefined) {
                        updateData.bio = bio;
                }

                if (availability !== undefined) {
                        updateData.availability = availability;
                }

                if (isVisible !== undefined) {
                        if (typeof isVisible !== "boolean") {
                                return res.status(400).json({ message: "Invalid input" });
                        }
                        updateData.isVisible = isVisible;
                }

                let profile = await StudentProfile.findOne({ user: userId });

                if (!profile) {
                        profile = new StudentProfile({ user: userId, ...updateData });
                } else {
                        Object.assign(profile, updateData);
                }

                await profile.save();

                const populatedProfile = await populateProfile(StudentProfile.findById(profile._id));

                res.json({ profile: await populatedProfile.lean() });
        } catch (error) {
                console.error("Error in createOrUpdateStudentProfile", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getMyStudentProfile = async (req, res) => {
        try {
                const userId = req.user?._id;

                const profileQuery = populateProfile(StudentProfile.findOne({ user: userId }));
                const profile = await profileQuery.lean();

                if (!profile) {
                        return res.json({ profile: null });
                }

                res.json({ profile });
        } catch (error) {
                console.error("Error in getMyStudentProfile", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const publicGetStudentProfile = async (req, res) => {
        try {
                const { userId } = req.params;

                const profileQuery = populateProfile(StudentProfile.findOne({ user: userId, isVisible: true }));
                const profile = await profileQuery.lean();

                if (!profile) {
                        return res.status(404).json({ message: "Profile not found" });
                }

                res.json({ profile });
        } catch (error) {
                console.error("Error in publicGetStudentProfile", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export default {
        createOrUpdateStudentProfile,
        getMyStudentProfile,
        publicGetStudentProfile,
};
