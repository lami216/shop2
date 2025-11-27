import Ad from "../models/Ad.js";
import StudyGroup from "../models/StudyGroup.js";
import Subject from "../models/Subject.js";
import TutorProfile from "../models/TutorProfile.js";

const SUBJECT_WEIGHT = 40;
const MAJOR_WEIGHT = 25;
const LEVEL_WEIGHT = 20;
const MODE_WEIGHT = 10;
const ACTIVITY_WEIGHT = 5;
const COMPLEMENTARITY_CAP = 25;
const RECENT_ACTIVITY_WINDOW_HOURS = 24;

const parseLevelNumber = (level) => {
  if (!level) return null;
  const match = String(level).match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const levelProximityScore = (studentLevel, candidateLevel) => {
  if (!studentLevel || !candidateLevel) return 0;
  if (studentLevel === candidateLevel) return LEVEL_WEIGHT;

  const studentLevelNum = parseLevelNumber(studentLevel);
  const candidateLevelNum = parseLevelNumber(candidateLevel);

  if (studentLevelNum && candidateLevelNum) {
    const diff = Math.abs(studentLevelNum - candidateLevelNum);
    if (diff === 1) {
      return Math.floor(LEVEL_WEIGHT / 2); // TODO: refine proximity curve
    }
  }

  return 0;
};

const modeScore = (preferredMode, candidateMode) => {
  if (!preferredMode || !candidateMode) return 0;
  if (candidateMode === "both") return MODE_WEIGHT - 1;
  if (preferredMode === "both") return MODE_WEIGHT - 1;
  return preferredMode === candidateMode ? MODE_WEIGHT : 0;
};

const isRecentlyActive = (date) => {
  if (!date) return false;
  const now = Date.now();
  const delta = now - new Date(date).getTime();
  return delta <= RECENT_ACTIVITY_WINDOW_HOURS * 60 * 60 * 1000;
};

export const computeBaseMatchScore = (
  studentProfile,
  subject,
  candidate,
  studentPreferredMode = "both"
) => {
  let score = 0;

  if (candidate?.subjectMatches) {
    score += SUBJECT_WEIGHT;
  } else {
    return 0; // Mandatory filter
  }

  const studentMajorId = studentProfile?.major?.toString();
  const candidateMajorId = candidate?.major?.toString();
  const subjectMajorId = subject?.major?.toString();

  if (studentMajorId && candidateMajorId && studentMajorId === candidateMajorId) {
    score += MAJOR_WEIGHT;
  } else if (studentMajorId && subjectMajorId && studentMajorId === subjectMajorId) {
    score += Math.floor(MAJOR_WEIGHT * 0.6); // TODO: refine multi-major sharing detection
  } else if (candidateMajorId && subjectMajorId && candidateMajorId === subjectMajorId) {
    score += Math.floor(MAJOR_WEIGHT * 0.6);
  }

  score += levelProximityScore(studentProfile?.level, candidate?.level);

  score += modeScore(studentPreferredMode, candidate?.mode);

  if (isRecentlyActive(candidate?.activityDate)) {
    score += ACTIVITY_WEIGHT;
  }

  return Math.min(100, score);
};

const computeComplementarityBoost = ({ searchType, studentProfile, candidateOptions = {} }) => {
  let boost = 0;

  const studentNeedsExplain =
    studentProfile?.statusForHelp === "needExplain" ||
    studentProfile?.statusForHelp === "needsExplain" ||
    studentProfile?.statusForPartners === "needExplain";
  const studentCanExplain =
    studentProfile?.statusForHelp === "canExplain" ||
    studentProfile?.statusForHelp === "readyToHelp" ||
    studentProfile?.statusForPartners === "canExplain";

  const candidateReadyToHelp =
    candidateOptions?.canExplain ||
    candidateOptions?.readyToHelp ||
    candidateOptions?.readyToExplain ||
    candidateOptions?.offersHelp;
  const candidateNeedsExplain = candidateOptions?.needExplain || candidateOptions?.needsHelp;

  if (searchType === "partner") {
    if (studentNeedsExplain && candidateReadyToHelp) {
      boost = COMPLEMENTARITY_CAP;
    } else if (studentCanExplain && candidateNeedsExplain) {
      boost = Math.floor(COMPLEMENTARITY_CAP * 0.8);
    } else if (studentNeedsExplain && candidateNeedsExplain) {
      boost = Math.floor(COMPLEMENTARITY_CAP * 0.4);
    }
  }

  if (searchType === "help") {
    if (studentNeedsExplain && candidateReadyToHelp) {
      boost = COMPLEMENTARITY_CAP;
    }
  }

  if (searchType === "group") {
    if (candidateOptions?.helpOrientation && studentNeedsExplain) {
      boost = Math.floor(COMPLEMENTARITY_CAP * 0.4);
    }
  }

  // TODO: Extend complementarity for tutor-group collaboration scenarios
  return boost;
};

export const findPartnerCandidates = async ({
  student,
  studentProfile,
  subject,
  studentPreferredMode,
}) => {
  const ads = await Ad.find({
    adType: "partner",
    subject: subject?._id,
    creator: { $ne: student?._id },
  })
    .limit(100)
    .populate({
      path: "creator",
      select: "name gender avatar role studentProfile updatedAt",
      populate: {
        path: "studentProfile",
        select: "major level college statusForPartners statusForHelp",
      },
    });

  const results = ads
    .map((ad) => {
      const candidateProfile = ad?.creator?.studentProfile;
      const baseScore = computeBaseMatchScore(
        studentProfile,
        subject,
        {
          major: candidateProfile?.major,
          level: candidateProfile?.level,
          mode: ad?.options?.mode || ad?.options?.preferredMode,
          activityDate: ad?.updatedAt || ad?.creator?.updatedAt,
          subjectMatches: true,
        },
        studentPreferredMode
      );

      const complementarityBoost = computeComplementarityBoost({
        searchType: "partner",
        studentProfile,
        candidateOptions: ad?.options,
      });

      const matchScore = Math.min(100, baseScore + complementarityBoost);

      return {
        type: "partner",
        userId: ad?.creator?._id,
        adId: ad?._id,
        subject: subject?._id,
        matchScore,
        basicProfile: {
          name: ad?.creator?.name,
          gender: ad?.creator?.gender,
          level: candidateProfile?.level,
          major: candidateProfile?.major,
          college: candidateProfile?.college,
        },
        partnerOptions: ad?.options || {},
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 50);

  return results;
};

export const findGroupCandidates = async ({ student, studentProfile, subject, studentPreferredMode }) => {
  const groups = await StudyGroup.find({ subjectsIncluded: subject?._id })
    .limit(100)
    .populate({ path: "creator", select: "name gender avatar role updatedAt" });

  const groupAds = await Ad.find({ adType: "group", subject: subject?._id })
    .limit(100)
    .populate({
      path: "creator",
      select: "name gender avatar role studentProfile updatedAt",
      populate: { path: "studentProfile", select: "major level college" },
    });

  const results = [];

  groups.forEach((group) => {
    const baseScore = computeBaseMatchScore(
      studentProfile,
      subject,
      {
        major: subject?.major, // TODO: allow group major tagging
        level: subject?.level,
        mode: group?.mode,
        activityDate: group?.updatedAt,
        subjectMatches: true,
      },
      studentPreferredMode
    );

    const complementarityBoost = computeComplementarityBoost({
      searchType: "group",
      studentProfile,
      candidateOptions: { helpOrientation: group?.options?.helpOrientation },
    });

    results.push({
      type: "group",
      groupId: group?._id,
      subjectIds: group?.subjectsIncluded,
      matchScore: Math.min(100, baseScore + complementarityBoost),
      size: group?.maxMembers,
      mode: group?.mode,
      basicInfo: {
        groupName: group?.groupName,
        description: group?.description,
        creator: group?.creator,
      },
    });
  });

  groupAds.forEach((ad) => {
    const creatorProfile = ad?.creator?.studentProfile;
    const baseScore = computeBaseMatchScore(
      studentProfile,
      subject,
      {
        major: creatorProfile?.major || subject?.major,
        level: ad?.options?.level || subject?.level,
        mode: ad?.options?.mode || ad?.options?.preferredMode,
        activityDate: ad?.updatedAt,
        subjectMatches: true,
      },
      studentPreferredMode
    );

    const complementarityBoost = computeComplementarityBoost({
      searchType: "group",
      studentProfile,
      candidateOptions: ad?.options,
    });

    results.push({
      type: "group",
      adId: ad?._id,
      subjectIds: [subject?._id],
      matchScore: Math.min(100, baseScore + complementarityBoost),
      size: ad?.options?.size,
      mode: ad?.options?.mode,
      basicInfo: {
        description: ad?.description,
        creator: ad?.creator,
      },
    });
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 50);
};

export const findTutorCandidates = async ({ studentProfile, subject, studentPreferredMode }) => {
  const tutors = await TutorProfile.find({
    $or: [{ subjects: subject?._id }, { "subjectPricing.subject": subject?._id }],
  })
    .limit(100)
    .populate({
      path: "userId",
      select: "name gender avatar role updatedAt",
    })
    .populate({ path: "teacherBadge", select: "name subscriptionRate" });

  const results = tutors
    .map((tutor) => {
      const candidateLevel = tutor?.levels?.includes(studentProfile?.level)
        ? studentProfile?.level
        : tutor?.levels?.[0];
      const baseScore = computeBaseMatchScore(
        studentProfile,
        subject,
        {
          major: tutor?.specialties?.[0] || subject?.major,
          level: candidateLevel,
          mode: tutor?.teachingMode || tutor?.options?.mode, // TODO: normalize tutor mode storage
          activityDate: tutor?.updatedAt || tutor?.userId?.updatedAt,
          subjectMatches: true,
        },
        studentPreferredMode
      );

      const pricingEntry = tutor?.subjectPricing?.find((entry) =>
        entry?.subject?.toString() === subject?._id?.toString()
      );

      return {
        type: "tutor",
        tutorId: tutor?._id,
        userId: tutor?.userId?._id,
        subjectId: subject?._id,
        matchScore: baseScore,
        pricing: {
          monthly: pricingEntry?.monthly ?? tutor?.pricingMonthly,
          semester: pricingEntry?.semester ?? tutor?.pricingSemester,
        },
        badge: tutor?.teacherBadge,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 50);

  return results;
};

export const findHelpCandidates = async ({
  student,
  studentProfile,
  subject,
  studentPreferredMode,
}) => {
  const ads = await Ad.find({
    adType: "help",
    subject: subject?._id,
    creator: { $ne: student?._id },
  })
    .limit(100)
    .populate({
      path: "creator",
      select: "name gender avatar role studentProfile updatedAt",
      populate: {
        path: "studentProfile",
        select: "major level college statusForHelp",
      },
    });

  const results = ads
    .filter((ad) => ad?.options?.readyToHelp || ad?.options?.canExplain || ad?.options?.readyToExplain)
    .map((ad) => {
      const candidateProfile = ad?.creator?.studentProfile;
      const baseScore = computeBaseMatchScore(
        studentProfile,
        subject,
        {
          major: candidateProfile?.major,
          level: candidateProfile?.level,
          mode: ad?.options?.mode || ad?.options?.preferredMode,
          activityDate: ad?.updatedAt,
          subjectMatches: true,
        },
        studentPreferredMode
      );

      const complementarityBoost = computeComplementarityBoost({
        searchType: "help",
        studentProfile,
        candidateOptions: ad?.options,
      });

      return {
        type: "help",
        helperUserId: ad?.creator?._id,
        adId: ad?._id,
        subjectId: subject?._id,
        matchScore: Math.min(100, baseScore + complementarityBoost),
        helperProfile: {
          name: ad?.creator?.name,
          gender: ad?.creator?.gender,
          level: candidateProfile?.level,
          major: candidateProfile?.major,
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 50);

  return results;
};

export const findSubjectById = async (subjectId) => {
  const subject = await Subject.findById(subjectId);
  return subject;
};

// TODO: add unit tests for computeBaseMatchScore and helper search functions
