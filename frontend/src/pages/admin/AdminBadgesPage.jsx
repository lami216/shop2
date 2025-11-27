import { useEffect, useState } from "react";

import ErrorBox from "../../components/ui/ErrorBox";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { fetchAdminBadges, updateAdminBadge } from "../../services/adminService";

const AdminBadgesPage = () => {
        const [badges, setBadges] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const loadBadges = async () => {
                try {
                        const data = await fetchAdminBadges();
                        setBadges(data || []);
                } catch (err) {
                        setError(err.message || "Failed to load badges");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                loadBadges();
        }, []);

        const handleChange = (id, field, value) => {
                setBadges((prev) => prev.map((badge) => (badge._id === id ? { ...badge, [field]: value } : badge)));
        };

        const handleSave = async (badge) => {
                try {
                        await updateAdminBadge(badge._id, {
                                incomeMin: Number(badge.incomeMin),
                                incomeMax: badge.incomeMax === null || badge.incomeMax === "" ? null : Number(badge.incomeMax),
                                subscriptionRate: Number(badge.subscriptionRate),
                        });
                        loadBadges();
                } catch (err) {
                        setError(err.message || "Failed to update badge");
                }
        };

        if (loading) return <LoadingSpinner label='Loading badges...' />;
        if (error) return <ErrorBox message={error} onRetry={loadBadges} />;

        return (
                <div className='space-y-4'>
                        <h2 className='text-xl font-semibold text-kingdom-cream'>Badges</h2>
                        <div className='grid gap-4 md:grid-cols-3'>
                                {badges.length === 0 && <p>No records found</p>}
                                {badges.map((badge) => (
                                        <div key={badge._id} className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                                <h3 className='text-lg font-semibold capitalize text-kingdom-gold'>{badge.name}</h3>
                                                <label className='mt-2 block text-sm text-kingdom-cream'>Income Min</label>
                                                <input
                                                        type='number'
                                                        value={badge.incomeMin ?? ""}
                                                        onChange={(e) => handleChange(badge._id, "incomeMin", e.target.value)}
                                                        className='w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                                />
                                                <label className='mt-2 block text-sm text-kingdom-cream'>Income Max</label>
                                                <input
                                                        type='number'
                                                        value={badge.incomeMax ?? ""}
                                                        onChange={(e) => handleChange(badge._id, "incomeMax", e.target.value)}
                                                        className='w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                                />
                                                <label className='mt-2 block text-sm text-kingdom-cream'>Subscription Rate</label>
                                                <input
                                                        type='number'
                                                        step='0.01'
                                                        value={badge.subscriptionRate ?? ""}
                                                        onChange={(e) => handleChange(badge._id, "subscriptionRate", e.target.value)}
                                                        className='w-full rounded border border-kingdom-gold/30 bg-black/20 p-2'
                                                />
                                                <button
                                                        className='mt-3 rounded bg-kingdom-gold px-3 py-1 text-sm font-semibold text-kingdom-charcoal'
                                                        onClick={() => handleSave(badge)}
                                                >
                                                        Save
                                                </button>
                                                {/* TODO: recalculate tutor badges when ranges change */}
                                        </div>
                                ))}
                        </div>
                </div>
        );
};

export default AdminBadgesPage;
