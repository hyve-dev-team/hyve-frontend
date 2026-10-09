import { useEffect, useState } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import AdminLayout from '../../components/layout/AdminLayout';
import config from '../../config';
import { hyveError, hyveSuccess } from '../../utils/hyveToast';

import {
    FiCheckCircle,
    FiClock,
    FiEye,
    FiInfo,
    FiLock,
    FiRefreshCw,
    FiRotateCcw,
    FiShield,
    FiUser,
    FiXCircle
} from 'react-icons/fi';
import { IoCloseOutline } from 'react-icons/io5';

const AdminTransactions = () => {
    const [overview, setOverview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters: all, PENDING, PAID, RELEASED, REFUNDED, FAILED
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for viewing transaction details
    const [selectedTx, setSelectedTx] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [showRefundInput, setShowRefundInput] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter, searchQuery]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await config.getAPI({
                url: '/api/v1/admin/transactions',
                params
            });

            if (res?.success && res?.data) {
                setOverview(res.data);
            } else {
                setOverview({
                    totalVolume: 0,
                    pendingEscrow: 0,
                    releasedPayments: 0,
                    totalRefunds: 0,
                    transactions: []
                });
                if (res?.message) setError(res.message);
            }
        } catch (err) {
            console.error('Failed to load transactions:', err);
            setError(err?.message || 'Unable to connect to backend server to load transactions.');
            setOverview({
                totalVolume: 0,
                pendingEscrow: 0,
                releasedPayments: 0,
                totalRefunds: 0,
                transactions: []
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReleaseEscrow = async (id) => {
        setIsActionLoading(true);
        try {
            await config.postAPI({
                url: `/api/v1/admin/transactions/${id}/release`,
                params: {}
            });
            hyveSuccess('Escrow Released', 'Funds successfully disbursed to verified landlord account.');
            if (selectedTx && selectedTx.id === id) {
                setSelectedTx((prev) => ({ ...prev, paymentStatus: 'RELEASED', escrowStatus: 'RELEASED_TO_LANDLORD' }));
            }
            fetchTransactions();
        } catch (err) {
            console.error('Failed to release escrow:', err);
            hyveError('Release Failed', err?.message || 'Could not release escrow payment on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRefundEscrow = async (id) => {
        setIsActionLoading(true);
        try {
            await config.postAPI({
                url: `/api/v1/admin/transactions/${id}/refund`,
                params: { reason: refundReason || 'Tenant refund approved by administrator' }
            });
            hyveSuccess('Refund Processed', 'Escrow funds reversed back to tenant account.');
            setShowRefundInput(false);
            if (selectedTx && selectedTx.id === id) {
                setSelectedTx((prev) => ({ ...prev, paymentStatus: 'REFUNDED', escrowStatus: 'REFUNDED_TO_TENANT' }));
            }
            fetchTransactions();
        } catch (err) {
            console.error('Failed to refund escrow:', err);
            hyveError('Refund Failed', err?.message || 'Could not process refund on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '-';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return '-';
        }
    };

    const transactions = overview?.transactions || [];

    // Realistic counts for the 5 payment statuses
    const pendingCount = transactions.filter((t) => (t.paymentStatus || '').toUpperCase() === 'PENDING').length;
    const paidCount = transactions.filter((t) => (t.paymentStatus || '').toUpperCase() === 'PAID').length;
    const releasedCount = transactions.filter((t) => (t.paymentStatus || '').toUpperCase() === 'RELEASED').length;
    const refundedCount = transactions.filter((t) => (t.paymentStatus || '').toUpperCase() === 'REFUNDED').length;
    const failedCount = transactions.filter((t) => (t.paymentStatus || '').toUpperCase() === 'FAILED').length;

    return (
        <AdminLayout>
            <AdminHeader
                title="Payments & Transactions"
                showWavingHand={false}
                searchValue={searchQuery}
                onSearch={setSearchQuery}
            />

            <main className="p-6 sm:p-10 space-y-8 max-w-7xl">
                {/* Clear Sandbox / Demo Label Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 text-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                            <FiShield className="text-lg" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-poppins">Sandbox Escrow Environment</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-stone-900">
                                    Demo Mode
                                </span>
                            </div>
                            <p className="text-[11px] text-stone-300 mt-0.5">
                                Showing clean escrow transactions, verified tenant payments, and landlord disbursements without inflated figures.
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-stone-400 shrink-0">
                        {transactions.length} Records Tracked
                    </span>
                </div>

                {/* Error Banner with Retry */}
                {error && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <FiInfo className="text-base text-amber-600 shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={fetchTransactions}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
                        >
                            <FiRefreshCw className="text-xs" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* 1. Simple, Clean Metric Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Total Volume Tracked</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.totalVolume || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">{transactions.length} Total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Held in Escrow (Paid)</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.pendingEscrow || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                                {paidCount} Secured
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Released to Landlords</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#12B76A] font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.releasedPayments || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-emerald-700 bg-[#E6F8EF] px-2 py-0.5 rounded-full font-bold">
                                {releasedCount} Disbursed
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Refunded / Pending</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.totalRefunds || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                                {refundedCount} Reversed
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Main Card with Search, Filter Tabs, and Transactions Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Header bar with filters */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                        <div>
                            <h2 className="text-lg font-bold text-stone-900 font-poppins">Escrow & Payment Records</h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Simple payment status tracking for student reservations, escrow locks, and disbursements.
                            </p>
                        </div>

                        {/* 5 Clear Payment Status Tabs */}
                        <div className="flex flex-wrap p-1 bg-stone-100 rounded-full text-xs font-semibold gap-1">
                            {[
                                { label: 'All', value: 'all', count: transactions.length },
                                { label: 'Pending', value: 'PENDING', count: pendingCount },
                                { label: 'Paid (Escrow)', value: 'PAID', count: paidCount },
                                { label: 'Released', value: 'RELEASED', count: releasedCount },
                                { label: 'Refunded', value: 'REFUNDED', count: refundedCount },
                                { label: 'Failed', value: 'FAILED', count: failedCount }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === tab.value
                                            ? 'bg-white text-stone-900 shadow-xs'
                                            : 'text-stone-500 hover:text-stone-800'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="text-[10px] opacity-75 font-bold">({tab.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 pl-2">Reference</th>
                                    <th className="pb-3">Property</th>
                                    <th className="pb-3">Tenant</th>
                                    <th className="pb-3">Landlord</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Payment Status</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <div className="w-8 h-8 border-2 border-[#FA6400]/20 border-t-[#FA6400] rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-xs text-stone-500 font-medium">Loading transaction records...</p>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-stone-400 text-xs sm:text-sm">
                                            No transaction records found matching this status.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => {
                                        const pStatus = (tx.paymentStatus || 'PENDING').toUpperCase();

                                        return (
                                            <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                                                {/* Reference */}
                                                <td className="py-4 pl-2 font-mono text-xs font-bold text-stone-800">
                                                    {tx.referenceNumber}
                                                </td>

                                                {/* Property */}
                                                <td className="py-4 text-xs font-bold text-stone-900 max-w-[180px] truncate" title={tx.propertyName}>
                                                    {tx.propertyName || 'Property Lease'}
                                                </td>

                                                {/* Tenant */}
                                                <td className="py-4 text-xs text-stone-700">
                                                    <div className="font-semibold text-stone-900">{tx.tenantName || 'Tenant'}</div>
                                                    <div className="text-[11px] text-stone-400">{tx.tenantEmail || '-'}</div>
                                                </td>

                                                {/* Landlord */}
                                                <td className="py-4 text-xs text-stone-700">
                                                    <div className="font-semibold text-stone-900">{tx.landlordName || 'Verified Landlord'}</div>
                                                    <div className="text-[11px] text-stone-400">{tx.landlordEmail || '-'}</div>
                                                </td>

                                                {/* Amount */}
                                                <td className="py-4 text-xs font-bold text-stone-900">
                                                    ₦ {Number(tx.amount || 0).toLocaleString()}
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 text-xs text-stone-500">
                                                    {formatDate(tx.createdAt)}
                                                </td>

                                                {/* 5 Clear Payment Status Badges */}
                                                <td className="py-4">
                                                    {pStatus === 'PAID' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                            <FiLock className="text-xs" />
                                                            <span>Paid (In Escrow)</span>
                                                        </span>
                                                    )}
                                                    {pStatus === 'RELEASED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A] border border-emerald-200">
                                                            <FiCheckCircle className="text-xs" />
                                                            <span>Released</span>
                                                        </span>
                                                    )}
                                                    {pStatus === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                            <FiClock className="text-xs" />
                                                            <span>Pending</span>
                                                        </span>
                                                    )}
                                                    {pStatus === 'REFUNDED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                                            <FiRotateCcw className="text-xs" />
                                                            <span>Refunded</span>
                                                        </span>
                                                    )}
                                                    {pStatus === 'FAILED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                            <FiXCircle className="text-xs" />
                                                            <span>Failed</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTx(tx)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer"
                                                            title="View Payment Breakdown"
                                                        >
                                                            <FiEye />
                                                        </button>

                                                        {pStatus === 'PAID' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReleaseEscrow(tx.id)}
                                                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                                                                title="Release Escrow to Landlord"
                                                            >
                                                                Release
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Transaction Detail Slide-Over Modal */}
            {selectedTx && (
                <div
                    className="fixed inset-0 z-[500] flex items-center justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
                    onClick={() => {
                        setSelectedTx(null);
                        setShowRefundInput(false);
                    }}
                >
                    <div
                        className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-[#FA6400]">
                                            {selectedTx.referenceNumber}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                            {selectedTx.paymentStatus}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 font-poppins mt-1">
                                        Payment Breakdown
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTx(null)}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Amount Summary */}
                            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 text-center space-y-1">
                                <span className="text-xs font-semibold text-stone-500">Total Escrow Amount</span>
                                <div className="text-3xl font-extrabold text-stone-900 font-poppins">
                                    ₦ {Number(selectedTx.amount || 0).toLocaleString()}
                                </div>
                                <span className="text-[11px] text-emerald-600 font-bold block">
                                    Funds Protected by Hyve Haven Escrow
                                </span>
                            </div>

                            {/* Property Info */}
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                    Property
                                </h4>
                                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                                    <p className="font-bold text-stone-900">{selectedTx.propertyName}</p>
                                    <p className="text-stone-500 text-[11px] mt-0.5">{selectedTx.propertyLocation || 'Location on file'}</p>
                                </div>
                            </div>

                            {/* Tenant Info */}
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-1.5">
                                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                    <FiUser className="text-[#FA6400]" />
                                    <span>Tenant (Payer)</span>
                                </h4>
                                <p><strong>Name:</strong> {selectedTx.tenantName}</p>
                                <p><strong>Email:</strong> {selectedTx.tenantEmail}</p>
                                <p><strong>Phone:</strong> {selectedTx.tenantPhone || 'N/A'}</p>
                            </div>

                            {/* Landlord Info */}
                            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs space-y-1.5">
                                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                    <FiUser className="text-[#FA6400]" />
                                    <span>Landlord (Beneficiary)</span>
                                </h4>
                                <p><strong>Name:</strong> {selectedTx.landlordName}</p>
                                <p><strong>Email:</strong> {selectedTx.landlordEmail}</p>
                                <p><strong>Phone:</strong> {selectedTx.landlordPhone || 'N/A'}</p>
                            </div>

                            {/* Refund Input if toggled */}
                            {showRefundInput && (
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                                    <h4 className="text-xs font-bold text-purple-900">Confirm Escrow Refund</h4>
                                    <textarea
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        placeholder="Reason for refund (e.g. Property unverified or lease cancelled)..."
                                        rows={2}
                                        className="w-full p-2.5 text-xs rounded-xl border border-purple-200 bg-white outline-none focus:border-purple-400"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRefundEscrow(selectedTx.id)}
                                            disabled={isActionLoading}
                                            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            Confirm & Reverse Funds
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRefundInput(false)}
                                            className="px-3 py-2 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                            {selectedTx.paymentStatus === 'PAID' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleReleaseEscrow(selectedTx.id)}
                                        disabled={isActionLoading}
                                        className="flex-1 py-3 bg-[#12B76A] hover:bg-[#0ea35c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle />
                                        <span>Release to Landlord</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowRefundInput(!showRefundInput)}
                                        disabled={isActionLoading}
                                        className="px-4 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Refund Tenant
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTransactions;
