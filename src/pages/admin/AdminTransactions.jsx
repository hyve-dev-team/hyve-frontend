import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import {
    FiSearch,
    FiCheckCircle,
    FiRotateCcw,
    FiInfo,
    FiRefreshCw,
    FiCalendar,
    FiArrowUpRight,
    FiDollarSign,
    FiLock,
    FiUser,
    FiEye,
    FiFileText
} from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet, MdPayment } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';

const AdminTransactions = () => {
    const [overview, setOverview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all'); // all, HELD_IN_ESCROW, RELEASED_TO_LANDLORD, REFUNDED_TO_TENANT
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
                setOverview(null);
                if (res?.message) {
                    setError(res.message);
                }
            }
        } catch (err) {
            console.error('Failed to load transactions:', err);
            setError(err?.message || 'Unable to retrieve escrow transactions from server.');
            setOverview(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReleaseEscrow = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await config.postAPI({
                url: `/api/v1/admin/transactions/${id}/release`,
                params: {}
            });

            if (res?.success) {
                hyveSuccess('Escrow Released', 'Funds successfully disbursed to verified landlord account.');
                if (selectedTx && selectedTx.id === id) {
                    setSelectedTx((prev) => ({ ...prev, escrowStatus: 'RELEASED_TO_LANDLORD' }));
                }
                fetchTransactions();
            } else {
                hyveError('Release Failed', res?.message || 'Could not release escrow funds');
            }
        } catch (err) {
            console.error('Release failed:', err);
            hyveError('Error', err?.message || 'An error occurred during release');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRefundEscrow = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await config.postAPI({
                url: `/api/v1/admin/transactions/${id}/refund`,
                params: { reason: refundReason || 'Tenant refund approved by administrator' }
            });

            if (res?.success) {
                hyveSuccess('Refund Processed', 'Escrow funds reversed back to tenant account.');
                setShowRefundInput(false);
                if (selectedTx && selectedTx.id === id) {
                    setSelectedTx((prev) => ({ ...prev, escrowStatus: 'REFUNDED_TO_TENANT' }));
                }
                fetchTransactions();
            } else {
                hyveError('Refund Failed', res?.message || 'Could not refund escrow');
            }
        } catch (err) {
            console.error('Refund failed:', err);
            hyveError('Error', err?.message || 'An error occurred during refund');
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

    return (
        <AdminLayout>
            <AdminHeader
                title="Payments & Transactions"
                showWavingHand={false}
                searchValue={searchQuery}
                onSearch={setSearchQuery}
            />

            <main className="p-6 sm:p-10 space-y-8 max-w-7xl">
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

                {/* 1. Metric Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Total Escrow Volume</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.totalVolume || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">All Time</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Held in Escrow</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#FA6400] font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.pendingEscrow || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                                Protected
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Released to Landlords</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#12B76A] font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.releasedPayments || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-emerald-600 bg-[#E6F8EF] px-2 py-0.5 rounded-full font-bold">
                                Disbursed
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Platform Revenue (5%)</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#7F56D9] font-poppins">
                                {isLoading ? '-' : `₦ ${Number(overview?.platformFeeEarned || 0).toLocaleString()}`}
                            </span>
                            <span className="text-xs text-purple-600 bg-[#F4EBFF] px-2 py-0.5 rounded-full font-bold">
                                Fees
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Main Card with Search, Filter Tabs, and Transactions Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Header bar with filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                        <div>
                            <h2 className="text-lg font-bold text-stone-900 font-poppins">Escrow & Payment Records</h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Audit student lease reservation payments, security locks, and verified disbursements.
                            </p>
                        </div>

                        {/* Status filter tabs */}
                        <div className="flex p-1 bg-stone-100 rounded-full text-xs font-semibold">
                            {[
                                { label: 'All Records', value: 'all' },
                                { label: 'Held in Escrow', value: 'HELD_IN_ESCROW' },
                                { label: 'Released', value: 'RELEASED_TO_LANDLORD' },
                                { label: 'Refunded', value: 'REFUNDED_TO_TENANT' }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                                        statusFilter === tab.value
                                            ? 'bg-white text-stone-900 shadow-xs'
                                            : 'text-stone-500 hover:text-stone-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 pl-2">Reference</th>
                                    <th className="pb-3">Property</th>
                                    <th className="pb-3">Tenant</th>
                                    <th className="pb-3">Landlord</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Escrow Status</th>
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
                                            No transaction records found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                                            {/* Reference */}
                                            <td className="py-4 pl-2 font-mono text-xs font-bold text-stone-800">
                                                {tx.referenceNumber}
                                            </td>

                                            {/* Property */}
                                            <td className="py-4 text-xs font-bold text-stone-900 max-w-[180px] truncate" title={tx.propertyName}>
                                                {tx.propertyName || 'Verified Apartment'}
                                            </td>

                                            {/* Tenant */}
                                            <td className="py-4 text-xs text-stone-700">
                                                <div className="font-semibold text-stone-900">{tx.tenantName || 'Tenant'}</div>
                                                <div className="text-[11px] text-stone-400">{tx.tenantEmail || '-'}</div>
                                            </td>

                                            {/* Landlord */}
                                            <td className="py-4 text-xs text-stone-700">
                                                <div className="font-semibold text-stone-900">{tx.landlordName || 'Landlord'}</div>
                                                <div className="text-[11px] text-stone-400">{tx.landlordEmail || '-'}</div>
                                            </td>

                                            {/* Amount */}
                                            <td className="py-4 text-xs font-bold text-stone-900 font-poppins">
                                                ₦ {Number(tx.amount || 0).toLocaleString()}
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 text-xs text-stone-500">
                                                {formatDate(tx.createdAt)}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4">
                                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                                    tx.escrowStatus === 'RELEASED_TO_LANDLORD'
                                                        ? 'bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/40'
                                                        : tx.escrowStatus === 'REFUNDED_TO_TENANT'
                                                        ? 'bg-[#FEECEB] text-[#F04438] border border-red-200/40'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200/40'
                                                }`}>
                                                    {tx.escrowStatus === 'RELEASED_TO_LANDLORD'
                                                        ? 'Released'
                                                        : tx.escrowStatus === 'REFUNDED_TO_TENANT'
                                                        ? 'Refunded'
                                                        : 'Held in Escrow'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 text-right pr-2">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTx(tx)}
                                                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                                        title="Inspect Payment Details"
                                                    >
                                                        <FiEye className="text-xs" />
                                                    </button>

                                                    {tx.escrowStatus === 'HELD_IN_ESCROW' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReleaseEscrow(tx.id)}
                                                                disabled={isActionLoading}
                                                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px] transition-colors cursor-pointer"
                                                                title="Release Escrow to Landlord"
                                                            >
                                                                Release
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTx(tx);
                                                                    setShowRefundInput(true);
                                                                }}
                                                                disabled={isActionLoading}
                                                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-[11px] transition-colors cursor-pointer"
                                                                title="Refund to Tenant"
                                                            >
                                                                Refund
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#FA6400]">
                                        Payment Verification Receipt
                                    </span>
                                    <h3 className="text-lg font-bold text-stone-900 font-poppins">
                                        Ref: {selectedTx.referenceNumber}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTx(null);
                                        setShowRefundInput(false);
                                    }}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Escrow Amount Callout */}
                            <div className="p-6 bg-[#FFF2EA] border border-[#FA6400]/20 rounded-2xl text-center space-y-1">
                                <span className="text-xs text-stone-500 font-medium">Total Escrow Amount</span>
                                <p className="text-3xl font-extrabold text-[#FA6400] font-poppins">
                                    ₦ {Number(selectedTx.amount || 0).toLocaleString()}
                                </p>
                                <span className={`inline-block text-xs font-semibold px-3 py-0.5 rounded-full mt-2 ${
                                    selectedTx.escrowStatus === 'RELEASED_TO_LANDLORD'
                                        ? 'bg-[#E6F8EF] text-[#12B76A]'
                                        : selectedTx.escrowStatus === 'REFUNDED_TO_TENANT'
                                        ? 'bg-[#FEECEB] text-[#F04438]'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    Status: {selectedTx.escrowStatus}
                                </span>
                            </div>

                            {/* Transaction Details */}
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Property Listing</span>
                                    <span className="font-bold text-stone-800 text-right">{selectedTx.propertyName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Location</span>
                                    <span className="font-bold text-stone-800 text-right">{selectedTx.propertyLocation || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Transaction Date</span>
                                    <span className="font-bold text-stone-800">{formatDate(selectedTx.createdAt)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Move-in Date</span>
                                    <span className="font-bold text-stone-800">{formatDate(selectedTx.moveInDate)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Tenant</span>
                                    <span className="font-bold text-stone-800 text-right">
                                        {selectedTx.tenantName} ({selectedTx.tenantEmail})
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-stone-100">
                                    <span className="text-stone-400">Landlord</span>
                                    <span className="font-bold text-stone-800 text-right">
                                        {selectedTx.landlordName} ({selectedTx.landlordEmail})
                                    </span>
                                </div>
                            </div>

                            {/* Refund input section if toggled */}
                            {showRefundInput && (
                                <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3 text-xs">
                                    <h4 className="font-bold text-red-900">Specify Refund Justification</h4>
                                    <textarea
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        placeholder="Enter reason for returning funds to student..."
                                        rows={3}
                                        className="w-full p-3 bg-white border border-red-200 rounded-xl text-xs outline-none focus:border-red-400"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRefundEscrow(selectedTx.id)}
                                            disabled={isActionLoading}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                                        >
                                            {isActionLoading ? 'Processing...' : 'Confirm Full Refund'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRefundInput(false)}
                                            className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl font-medium cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        {selectedTx.escrowStatus === 'HELD_IN_ESCROW' && !showRefundInput && (
                            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleReleaseEscrow(selectedTx.id)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-[#12B76A] hover:bg-[#0ea35c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <FiCheckCircle />
                                    <span>Release to Landlord</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRefundInput(true)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiRotateCcw />
                                    <span>Refund to Tenant</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTransactions;
