import { useEffect, useState } from "react";

import ErrorBox from "../../components/ui/ErrorBox";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { fetchAdminUsers, updateAdminUser } from "../../services/adminService";

const AdminUsersPage = () => {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const loadUsers = async () => {
                try {
                        const data = await fetchAdminUsers({ limit: 50 });
                        setUsers(data || []);
                } catch (err) {
                        setError(err.message || "Failed to load users");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                loadUsers();
        }, []);

        const handleToggleActive = async (userId, currentState) => {
                try {
                        await updateAdminUser(userId, { isActive: !currentState });
                        loadUsers();
                } catch (err) {
                        setError(err.message || "Failed to update user");
                }
        };

        const handleRoleChange = async (userId, newRole) => {
                try {
                        await updateAdminUser(userId, { role: newRole });
                        loadUsers();
                } catch (err) {
                        setError(err.response?.data?.message || err.message || "Failed to update user");
                }
        };

        if (loading) return <LoadingSpinner label='Loading users...' />;
        if (error) return <ErrorBox message={error} onRetry={loadUsers} />;

        return (
                <div className='space-y-4'>
                        <h2 className='text-xl font-semibold text-kingdom-cream'>Users</h2>
                        <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-kingdom-gold/20'>
                                        <thead className='bg-kingdom-purple/40 text-left text-sm uppercase text-kingdom-cream/70'>
                                                <tr>
                                                        <th className='px-3 py-2'>Name</th>
                                                        <th className='px-3 py-2'>Email</th>
                                                        <th className='px-3 py-2'>Role</th>
                                                        <th className='px-3 py-2'>Active</th>
                                                        <th className='px-3 py-2'>Created</th>
                                                        <th className='px-3 py-2'>Actions</th>
                                                </tr>
                                        </thead>
                                        <tbody className='divide-y divide-kingdom-gold/10 text-sm'>
                                                {users.length === 0 && (
                                                        <tr>
                                                                <td className='px-3 py-3' colSpan={6}>
                                                                        No records found
                                                                </td>
                                                        </tr>
                                                )}
                                                {users.map((user) => (
                                                        <tr key={user._id} className='hover:bg-kingdom-purple/10'>
                                                                <td className='px-3 py-2'>{user.name}</td>
                                                                <td className='px-3 py-2'>{user.email}</td>
                                                                <td className='px-3 py-2'>
                                                                        <select
                                                                                className='rounded border border-kingdom-gold/30 bg-black/20 p-1'
                                                                                value={user.role}
                                                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                                        >
                                                                                <option value='student'>Student</option>
                                                                                <option value='tutor'>Tutor</option>
                                                                                <option value='admin'>Admin</option>
                                                                        </select>
                                                                </td>
                                                                <td className='px-3 py-2'>
                                                                        <span className={user.isActive ? "text-green-400" : "text-red-400"}>
                                                                                {user.isActive ? "Active" : "Disabled"}
                                                                        </span>
                                                                </td>
                                                                <td className='px-3 py-2'>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                                <td className='px-3 py-2'>
                                                                        <button
                                                                                className='rounded border border-kingdom-gold/40 px-3 py-1 text-xs text-kingdom-cream hover:bg-kingdom-purple/50'
                                                                                onClick={() => handleToggleActive(user._id, user.isActive)}
                                                                        >
                                                                                Toggle Active
                                                                        </button>
                                                                </td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>
                        {/* TODO: add pagination and server-side filters */}
                </div>
        );
};

export default AdminUsersPage;
