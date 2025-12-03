import StudentProfile from "../models/studentProfile.model.js";
import Subject from "../models/subject.model.js";
import Major from "../models/major.model.js";
import User from "../models/user.model.js";

const computeMatchScore = ({ querySubjectId, queryMajorId, queryLevel, queryStudyModes }, profile) => {
  let score = 0;

  // subject match: if the profile has the requested subject in its subjects array
  if (querySubjectId && Array.isArray(profile.subjects)) {
    const hasSubject = profile.subjects.some(
      (s) => String(s) === String(querySubjectId) || String(s?._id) === String(querySubjectId)
    );
    if (hasSubject) score += 40;
  }

  // major match
  if (queryMajorId && profile.major && String(profile.major?._id || profile.major) === String(queryMajorId)) {
    score += 30;
  }

  // level match (exact level)
  if (
    typeof queryLevel === "number" &&
    profile.level != null &&
    Number(profile.level) === Number(queryLevel)
  ) {
    score += 20;
  }

  // studyModes overlap
  if (Array.isArray(queryStudyModes) && queryStudyModes.length > 0 && Array.isArray(profile.studyModes)) {
    const lowerRequested = queryStudyModes.map((m) => String(m).toLowerCase());
    const lowerProfile = profile.studyModes.map((m) => String(m).toLowerCase());
    const overlap = lowerRequested.some((m) => lowerProfile.includes(m));
    if (overlap) score += 10;
  }

  return score;
};

export const searchStudentMatches = async (req, res) => {
  try {
    const {
      subjectId,
      majorId,
      level,
      studyModes,
      page = 1,
      limit = 20,
    } = req.body || {};

    const numericLevel = typeof level === "number" ? level : (typeof level === "string" ? Number(level) : undefined);
    const normalizedStudyModes = Array.isArray(studyModes) ? studyModes : [];

    const filter = { isVisible: true };

    // We don't strictly require filters, but they narrow the dataset
    if (majorId) {
      filter.major = majorId;
    }

    // If we have a level filter, we can also narrow by level here
    if (Number.isFinite(numericLevel)) {
      filter.level = numericLevel;
    }

    // We don’t filter by subject at the query level, we’ll score it later, but you could optionally
    // restrict to profiles that have at least one subject.
    // if (subjectId) {
    //   filter.subjects = subjectId;
    // }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Load profiles with user/basic relations
    const [profiles, total] = await Promise.all([
      StudentProfile.find(filter)
        .populate({ path: "user", select: "name email role" })
        .populate({ path: "college", select: "name shortName" })
        .populate({ path: "major", select: "name code" })
        .populate({ path: "subjects", select: "name code level" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      StudentProfile.countDocuments(filter),
    ]);

    const queryContext = {
      querySubjectId: subjectId || null,
      queryMajorId: majorId || null,
      queryLevel: Number.isFinite(numericLevel) ? numericLevel : undefined,
      queryStudyModes: normalizedStudyModes,
    };

    const scored = (profiles || []).map((profile) => {
      const score = computeMatchScore(queryContext, profile);
      return {
        ...profile,
        matchScore: score,
      };
    });

    // Sort by matchScore desc, then by createdAt desc
    scored.sort((a, b) => {
      const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    res.json({
      results: scored,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: skip + scored.length < total,
      },
    });
  } catch (error) {
    console.error("Error in searchStudentMatches", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStudentPreview = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(12, Number(req.query.limit) || 6));

    const profiles = await StudentProfile.find({ isVisible: true })
      .populate({ path: "user", select: "name role" })
      .populate({ path: "major", select: "name code" })
      .populate({ path: "college", select: "name shortName" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ results: profiles });
  } catch (error) {
    console.error("Error in getStudentPreview", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  searchStudentMatches,
  getStudentPreview,
};
