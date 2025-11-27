import { useEffect, useState } from "react";
import { fetchAdminPayments, updateAdminPayment } from "../../services/adminService";

const AdminPaymentsPage = () => {
        const [payments, setPayments] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const loadPayments = async () => {
                try {
                        const data = await fetchAdminPayments({ limit: 50 });
                        setPayments(data || []);
                } catch (err) {
                        setError(err.message || "Failed to load payments");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                loadPayments();
        }, []);

        const handleStatusChange = async (id, status) => {
                try {
                        await updateAdminPayment(id, { status });
                        loadPayments();
                } catch (err) {
                        setError(err.message || "Failed to update payment");
                }
        };

        if (loading) return <p>Loading admin data...</p>;
        if (error) return <p className='text-red-400'>{error}</p>;

        return (
                <div className='space-y-4'>
                        <h2 className='text-xl font-semibold text-kingdom-cream'>Payments</h2>
                        <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-kingdom-gold/20'>
                                        <thead className='bg-kingdom-purple/40 text-left text-sm uppercase text-kingdom-cream/70'>
                                                <tr>
                                                        <th className='px-3 py-2'>Student</th>
                                                        <th className='px-3 py-2'>Tutor</th>
                                                        <th className='px-3 py-2'>Subject</th>
                                                        <th className='px-3 py-2'>Amount</th>
                                                        <th className='px-3 py-2'>Status</th>
                                                        <th className='px-3 py-2'>Confirmed</th>
                                                        <th className='px-3 py-2'>Created</th>
                                                </tr>
                                        </thead>
                                        <tbody className='divide-y divide-kingdom-gold/10 text-sm'>
                                                {payments.length === 0 && (
                                                        <tr>
                                                                <td className='px-3 py-3' colSpan={7}>
                                                                        No records found
                                                                </td>
                                                        </tr>
                                                )}
                                                {payments.map((payment) => (
                                                        <tr key={payment._id} className='hover:bg-kingdom-purple/10'>
                                                                <td className='px-3 py-2'>{payment.student?.name || "-"}</td>
                                                                <td className='px-3 py-2'>{payment.tutor?.name || "-"}</td>
                                                                <td className='px-3 py-2'>{payment.subject?.subjectName || "-"}</td>
                                                                <td className='px-3 py-2'>${payment.amount || 0}</td>
                                                                <td className='px-3 py-2'>
                                                                        <select
                                                                                className='rounded border border-kingdom-gold/30 bg-black/20 p-1'
                                                                                value={payment.status || "pending"}
                                                                                onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                                                                        >
                                                                                <option value='pending'>Pending</option>
                                                                                <option value='awaiting_receipt'>Awaiting Receipt</option>
                                                                                <option value='awaiting_tutor_confirmation'>Awaiting Tutor</option>
                                                                                <option value='confirmed'>Confirmed</option>
                                                                                <option value='rejected'>Rejected</option>
                                                                        </select>
                                                                </td>
                                                                <td className='px-3 py-2'>
                                                                        <span className={payment.isConfirmed ? "text-green-400" : "text-red-400"}>
                                                                                {payment.isConfirmed ? "Yes" : "No"}
                                                                        </span>
                                                                </td>
                                                                <td className='px-3 py-2'>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                ))}
                                        </tbody>
                                </table>
                        </div>
                        {/* TODO: add pagination and filtering */}
                </div>
        );
};

export default AdminPaymentsPage;
