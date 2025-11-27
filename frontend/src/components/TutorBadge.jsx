const BADGE_LABELS = {
        gold: "Gold Teacher",
        emerald: "Emerald Teacher",
        diamond: "Diamond Teacher",
};

const TutorBadge = ({ badgeName, icon, color }) => {
        if (!badgeName) return null;

        const normalized = badgeName?.toLowerCase?.() || "";
        const label = BADGE_LABELS[normalized] || badgeName;
        const className = `badge-chip badge-${normalized}`;

        return (
                <span className={className} data-color={color} data-icon={icon || normalized}>
                        {label}
                </span>
        );
};

export default TutorBadge;
