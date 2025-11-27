import Badge from "../models/Badge.js";

const DEFAULT_BADGES = [
  {
    name: "gold",
    color: "gold",
    icon: "badge-gold",
    incomeMin: 10000,
    incomeMax: 20000,
    subscriptionRate: 0.05,
  },
  {
    name: "emerald",
    color: "emerald",
    icon: "badge-emerald",
    incomeMin: 20000,
    incomeMax: 40000,
    subscriptionRate: 0.07,
  },
  {
    name: "diamond",
    color: "diamond",
    icon: "badge-diamond",
    incomeMin: 40000,
    incomeMax: null,
    subscriptionRate: 0.1,
  },
];

export const seedDefaultBadges = async () => {
  for (const badge of DEFAULT_BADGES) {
    const normalized = { ...badge, name: badge.name.toLowerCase() };

    await Badge.findOneAndUpdate(
      { name: normalized.name },
      { $setOnInsert: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // TODO: move seeding to a dedicated bootstrap pipeline with better logging
};

export const getAllBadges = async () => {
  return Badge.find({}).sort({ incomeMin: 1 });
};

export default seedDefaultBadges;
