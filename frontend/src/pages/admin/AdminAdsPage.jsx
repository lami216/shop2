import { useEffect, useState } from "react";
import { fetchAdminAds, updateAdminAd } from "../../services/adminService";

const AdminAdsPage = () => {
        const [ads, setAds] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const loadAds = async () => {
                try {
                        const data = await fetchAdminAds({ limit: 50 });
                        setAds(data || []);
                } catch (err) {
                        setError(err.message || "Failed to load ads");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                loadAds();
        }, []);

        const handleStatusChange = async (id, status) => {
                try {
                        await updateAdminAd(id, { status });
                        loadAds();
                } catch (err) {
                        setError(err.message || "Failed to update ad");
                }
        };

        if (loading) return <p>Loading admin data...</p>;
        if (error) return <p className='text-red-400'>{error}</p>;

        return (
                <div className='space-y-4'>
                        <h2 className='text-xl font-semibold text-kingdom-cream'>Ads</h2>
                        <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-kingdom-gold/20'>
                                        <thead className='bg-kingdom-purple/40 text-left text-sm uppercase text-kingdom-cream/70'>
                                                <tr>
                                                        <th className='px-3 py-2'>Type</th>
                                                        <th className='px-3 py-2'>Subject</th>
                                                        <th className='px-3 py-2'>Creator</th>
                                                        <th className='px-3 py-2'>Status</th>
                                                        <th className='px-3 py-2'>Created</th>
                                                </tr>
                                        </thead>
                                        <tbody className='divide-y divide-kingdom-gold/10 text-sm'>
                                                {ads.length === 0 && (
                                                        <tr>
                                                                <td className='px-3 py-3' colSpan={5}>
                                                                        No records found
                                                                </td>
                                                        </tr>
                                                )}
                                                {ads.map((ad) => (
                                                        <tr key={ad._id} className='hover:bg-kingdom-purple/10'>
                                                                <td className='px-3 py-2 capitalize'>{ad.adType}</td>
                                                                <td className='px-3 py-2'>{ad.subject?.subjectName || "-"}</td>
                                                                <td className='px-3 py-2'>{ad.creator?.name || "-"}</td>
                                                                <td className='px-3 py-2'>
                                                                        <select
                                                                                className='rounded border border-kingdom-gold/30 bg-black/20 p-1'
                                                                                value={ad.status || "pending"}
                                                                                onChange={(e) => handleStatusChange(ad._id, e.target.value)}
                                                                        >
                                                                                <option value='pending'>Pending</option>
                                                                                <option value='active'>Active</option>
                                                                                <option value='archived'>Archived</option>
                                                                                <option value='blocked'>Blocked</option>
                                                                        </select>
                                                                </td>
                                                                <td className='px-3 py-2'>{new Date(ad.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>
                        {/* TODO: add moderation notes and pagination */}
                </div>
        );
};

export default AdminAdsPage;
