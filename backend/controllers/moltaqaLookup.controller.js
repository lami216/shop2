import College from "../models/college.model.js";
import Major from "../models/major.model.js";
import Subject from "../models/subject.model.js";

export const getColleges = async (req, res) => {
        try {
                const colleges = await College.find({ isActive: true })
                        .sort({ name: 1 })
                        .lean();

                res.json({ colleges });
        } catch (error) {
                console.error(error);
                res.status(500).json({
                        message: "Server error",
                        error: error.message,
                });
        }
};

export const getMajors = async (req, res) => {
        try {
                const { college } = req.query;
                const filter = {};

                if (college) {
                        filter.college = college;
                }

                const majors = await Major.find(filter).sort({ name: 1 }).lean();

                res.json({ majors });
        } catch (error) {
                console.error(error);
                res.status(500).json({
                        message: "Server error",
                        error: error.message,
                });
        }
};

export const getSubjects = async (req, res) => {
        try {
                const { major, q } = req.query;
                const filter = { isActive: true };

                if (major) {
                        filter.major = major;
                }

                if (q && typeof q === "string" && q.trim() !== "") {
                        filter.name = {
                                $regex: q,
                                $options: "i",
                        };
                }

                const subjects = await Subject.find(filter).sort({ name: 1 }).lean();

                res.json({ subjects });
        } catch (error) {
                console.error(error);
                res.status(500).json({
                        message: "Server error",
                        error: error.message,
                });
        }
};
