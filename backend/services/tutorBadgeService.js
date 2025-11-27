import Badge from "../models/Badge.js";
import TutorProfile from "../models/TutorProfile.js";

export const updateTutorBadge = async (tutorId) => {
  try {
    const profile = await TutorProfile.findOne({ userId: tutorId });

    if (!profile) return null;

    const badges = await Badge.find({}).sort({ incomeMin: 1 });
    const income = profile.incomeMonth || 0;

    let matchedBadge = null;

    for (const badge of badges) {
      const meetsMin = typeof badge.incomeMin === "number" ? income >= badge.incomeMin : false;
      const underMax =
        badge.incomeMax === null || typeof badge.incomeMax === "undefined" || income <= badge.incomeMax;

      if (meetsMin && underMax) {
        matchedBadge = badge;
        break;
      }
    }

    profile.teacherBadge = matchedBadge ? matchedBadge._id : null;
    profile.subscriptionRate = matchedBadge ? matchedBadge.subscriptionRate : null;

    await profile.save();

    return matchedBadge;
  } catch (error) {
    // TODO: replace with structured logging once observability stack is ready
    console.error("Failed to update tutor badge", error?.message || error);
    return null;
  }
};

export default updateTutorBadge;
