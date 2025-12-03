import College from "../models/college.model.js";
import Major from "../models/major.model.js";
import Subject from "../models/subject.model.js";

/* ----------------------------- Colleges ----------------------------- */
export const createCollege = async (req, res) => {
        try {
                const { name, shortName, country, city, isActive } = req.body || {};

                if (!name || typeof name !== "string" || name.trim() === "") {
                        return res.status(400).json({ message: "Name is required" });
                }

                const college = await College.create({
                        name: name.trim(),
                        shortName,
                        country,
                        city,
                        isActive,
                });

                res.status(201).json(college.toObject());
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getAllColleges = async (req, res) => {
        try {
                const colleges = await College.find().sort({ name: 1 }).lean();
                res.json({ colleges });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateCollege = async (req, res) => {
        try {
                const { id } = req.params;
                const { name, shortName, country, city, isActive } = req.body || {};

                const updateData = {};

                if (name !== undefined) updateData.name = name;
                if (shortName !== undefined) updateData.shortName = shortName;
                if (country !== undefined) updateData.country = country;
                if (city !== undefined) updateData.city = city;
                if (isActive !== undefined) updateData.isActive = isActive;

                const updated = await College.findByIdAndUpdate(id, updateData, {
                        new: true,
                        lean: true,
                });

                if (!updated) {
                        return res.status(404).json({ message: "College not found" });
                }

                res.json(updated);
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteCollege = async (req, res) => {
        try {
                const { id } = req.params;
                const college = await College.findById(id);

                if (!college) {
                        return res.status(404).json({ message: "College not found" });
                }

                if (Object.prototype.hasOwnProperty.call(college.toObject(), "isActive")) {
                        college.isActive = false;
                        await college.save();
                } else {
                        await college.remove();
                }

                res.json({ success: true });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

/* ------------------------------ Majors ------------------------------ */
export const createMajor = async (req, res) => {
        try {
                const { name, college, code, isActive } = req.body || {};

                if (!name || typeof name !== "string" || name.trim() === "") {
                        return res.status(400).json({ message: "Name is required" });
                }

                if (!college) {
                        return res.status(400).json({ message: "College is required" });
                }

                const major = await Major.create({
                        name: name.trim(),
                        college,
                        code,
                        isActive,
                });

                res.status(201).json(major.toObject());
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getMajorsByCollege = async (req, res) => {
        try {
                const { collegeId } = req.params;
                const majors = await Major.find({ college: collegeId })
                        .sort({ name: 1 })
                        .lean();

                res.json({ majors });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateMajor = async (req, res) => {
        try {
                const { id } = req.params;
                const { name, college, code, isActive } = req.body || {};

                const updateData = {};

                if (name !== undefined) updateData.name = name;
                if (college !== undefined) updateData.college = college;
                if (code !== undefined) updateData.code = code;
                if (isActive !== undefined) updateData.isActive = isActive;

                const updated = await Major.findByIdAndUpdate(id, updateData, {
                        new: true,
                        lean: true,
                });

                if (!updated) {
                        return res.status(404).json({ message: "Major not found" });
                }

                res.json(updated);
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteMajor = async (req, res) => {
        try {
                const { id } = req.params;
                const major = await Major.findById(id);

                if (!major) {
                        return res.status(404).json({ message: "Major not found" });
                }

                if (Object.prototype.hasOwnProperty.call(major.toObject(), "isActive")) {
                        major.isActive = false;
                        await major.save();
                } else {
                        await major.remove();
                }

                res.json({ success: true });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

/* ----------------------------- Subjects ----------------------------- */
export const createSubject = async (req, res) => {
        try {
                const { name, major, code, level, semester, tags, isActive } = req.body || {};

                if (!name || typeof name !== "string" || name.trim() === "") {
                        return res.status(400).json({ message: "Name is required" });
                }

                if (!major) {
                        return res.status(400).json({ message: "Major is required" });
                }

                const subject = await Subject.create({
                        name: name.trim(),
                        major,
                        code,
                        level,
                        semester,
                        tags,
                        isActive,
                });

                res.status(201).json(subject.toObject());
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getSubjectsByMajor = async (req, res) => {
        try {
                const { majorId } = req.params;
                const subjects = await Subject.find({ major: majorId })
                        .sort({ name: 1 })
                        .lean();

                res.json({ subjects });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const updateSubject = async (req, res) => {
        try {
                const { id } = req.params;
                const { name, major, code, level, semester, tags, isActive } = req.body || {};

                const updateData = {};

                if (name !== undefined) updateData.name = name;
                if (major !== undefined) updateData.major = major;
                if (code !== undefined) updateData.code = code;
                if (level !== undefined) updateData.level = level;
                if (semester !== undefined) updateData.semester = semester;
                if (tags !== undefined) updateData.tags = tags;
                if (isActive !== undefined) updateData.isActive = isActive;

                const updated = await Subject.findByIdAndUpdate(id, updateData, {
                        new: true,
                        lean: true,
                });

                if (!updated) {
                        return res.status(404).json({ message: "Subject not found" });
                }

                res.json(updated);
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const deleteSubject = async (req, res) => {
        try {
                const { id } = req.params;
                const subject = await Subject.findById(id);

                if (!subject) {
                        return res.status(404).json({ message: "Subject not found" });
                }

                if (Object.prototype.hasOwnProperty.call(subject.toObject(), "isActive")) {
                        subject.isActive = false;
                        await subject.save();
                } else {
                        await subject.remove();
                }

                res.json({ success: true });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

/* --------------------------- Admin Structure --------------------------- */
export const getMoltaqaStructure = async (req, res) => {
        try {
                const [colleges, majors, subjects] = await Promise.all([
                        College.find().sort({ name: 1 }).lean(),
                        Major.find().sort({ name: 1 }).lean(),
                        Subject.find().sort({ name: 1 }).lean(),
                ]);

                const majorsByCollege = majors.reduce((acc, major) => {
                        const key = major.college?.toString();
                        if (!key) return acc;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(major);
                        return acc;
                }, {});

                const subjectsByMajor = subjects.reduce((acc, subject) => {
                        const key = subject.major?.toString();
                        if (!key) return acc;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(subject);
                        return acc;
                }, {});

                res.json({ colleges, majorsByCollege, subjectsByMajor });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};
