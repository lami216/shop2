import { useEffect, useState } from "react";

import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorBox from "../../components/ui/ErrorBox";
import { fetchAdminOverview } from "../../services/adminService";

const StatCard = ({ title, value }) => (
        <div className='rounded-xl border border-kingdom-gold/20 bg-black/30 p-4 shadow-royal-soft'>
                <p className='text-sm text-kingdom-cream/70'>{title}</p>
                <p className='text-2xl font-bold text-kingdom-gold'>{value}</p>
        </div>
);

const AdminOverview = () => {
        const [overview, setOverview] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
                const loadOverview = async () => {
                        try {
                                const data = await fetchAdminOverview();
                                setOverview(data);
                        } catch (err) {
                                setError(err.message || "Failed to load overview");
                        } finally {
                                setLoading(false);
                        }
                };

                loadOverview();
        }, []);

        if (loading) return <LoadingSpinner label='Loading admin data...' />;
        if (error) return <ErrorBox message={error} onRetry={() => window.location.reload()} />;
        if (!overview) return <p>No overview available</p>;

        const { users = {}, ads = [], payments = {}, tutorsByBadge = [] } = overview;

        return (
                <div className='space-y-6'>
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                <StatCard title='Total Users' value={users.total || 0} />
                                <StatCard title='Students' value={users.students || 0} />
                                <StatCard title='Tutors' value={users.tutors || 0} />
                                <StatCard title='Admins' value={users.admins || 0} />
                                <StatCard title='Study Groups' value={overview.studyGroups || 0} />
                                <StatCard title='Confirmed Payments' value={payments.confirmedCount || 0} />
                                <StatCard title='Confirmed Revenue' value={`$${payments.confirmedAmount || 0}`} />
                        </div>

                        <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                <h3 className='mb-2 text-lg font-semibold text-kingdom-cream'>Ads by Type</h3>
                                {ads.length === 0 ? (
                                        <p className='text-sm text-kingdom-cream/60'>No ads found</p>
                                ) : (
                                        <ul className='space-y-2 text-sm text-kingdom-cream/80'>
                                                {ads.map((ad) => (
                                                        <li key={ad.adType} className='flex items-center justify-between'>
                                                                <span className='capitalize'>{ad.adType || "unspecified"}</span>
                                                                <span className='text-kingdom-gold'>Total: {ad.total || 0}</span>
                                                                <span className='text-green-300'>Active: {ad.active || 0}</span>
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>

                        <div className='rounded-xl border border-kingdom-gold/20 bg-black/40 p-4'>
                                <h3 className='mb-2 text-lg font-semibold text-kingdom-cream'>Tutors by Badge</h3>
                                {tutorsByBadge.length === 0 ? (
                                        <p className='text-sm text-kingdom-cream/60'>No badge stats available</p>
                                ) : (
                                        <ul className='space-y-2 text-sm text-kingdom-cream/80'>
                                                {tutorsByBadge.map((badge) => (
                                                        <li key={badge.badge || "unassigned"} className='flex items-center justify-between'>
                                                                <span className='capitalize'>{badge.badge}</span>
                                                                <span className='text-kingdom-gold'>{badge.count || 0}</span>
                                                        </li>
                                                ))}
                                        </ul>
                                )}
                        </div>
                </div>
        );
};

export default AdminOverview;
