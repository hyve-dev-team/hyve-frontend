import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import { FiArrowUpRight, FiCheckCircle, FiXCircle, FiExternalLink, FiFileText, FiChevronRight, FiInfo, FiRefreshCw, FiImage } from 'react-icons/fi';
import { HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';
import { IoCloseOutline } from 'react-icons/io5';

const AdminUserManagement = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'landlord', 'agent'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'VERIFIED', 'PENDING', 'REJECTED'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for viewing application documents
    const [selectedApp, setSelectedApp] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [userTypeFilter, statusFilter, searchQuery]);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = {};
            if (userTypeFilter !== 'all') params.userType = userTypeFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await config.getAPI({
                url: '/api/v1/admin/applications',
                params
            });

            if (res?.success && Array.isArray(res?.data)) {
                setApplications(res.data);
            } else {
                setApplications([]);
                if (res?.message) {
                    setError(res.message);
                }
            }
        } catch (err) {
            console.error('Failed to load applications:', err);
            setError(err?.message || 'Unable to load verification applications from server.');
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Approve
    const handleApprove = async () => {
        if (!selectedApp?.id) return;
        setIsActionLoading(true);
        try {
            const res = await config.postAPI({
                url: `/api/v1/admin/applications/${selectedApp.id}/approve`,
                params: {}
            });
            if (res?.success) {
                hyveSuccess('Landlord Approved', `${selectedApp.userName} is now verified with the Hyve trust badge.`);
                setSelectedApp((prev) => ({ ...prev, status: 'VERIFIED', rejectionReason: null }));
                fetchApplications();
            } else {
                hyveError('Approval Failed', res?.message || 'Could not approve application');
            }
        } catch (err) {
            console.error('Approve failed:', err);
            hyveError('Error', err.message || 'An error occurred during approval');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handle Reject
    const handleReject = async () => {
        if (!selectedApp?.id) return;
        setIsActionLoading(true);
        try {
            const res = await config.postAPI({
                url: `/api/v1/admin/applications/${selectedApp.id}/reject`,
                params: { reason: rejectionReason }
            });
            if (res?.success) {
                hyveSuccess('Application Rejected', `The application for ${selectedApp.userName} has been rejected.`);
                setSelectedApp((prev) => ({ ...prev, status: 'REJECTED', rejectionReason }));
                setShowRejectInput(false);
                fetchApplications();
            } else {
                hyveError('Rejection Failed', res?.message || 'Could not reject application');
            }
        } catch (err) {
            console.error('Reject failed:', err);
            hyveError('Error', err.message || 'An error occurred during rejection');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Format Date helper (e.g. 21/02/2025)
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

    // Counts for tabs
    const allCount = applications.length;
    const landlordCount = applications.filter((a) => (a.userRole || '').toUpperCase() === 'LANDLORD').length;
    const agentCount = applications.filter((a) => (a.userRole || '').toUpperCase() === 'AGENT').length;

    return (
        <AdminLayout>
            <AdminHeader
                title="User Management"
                showWavingHand={true}
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
                            onClick={fetchApplications}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
                        >
                            <FiRefreshCw className="text-xs" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    {/* Top Row: Title, Filter Tabs, and Right Dropdowns */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                        {/* Title & Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-poppins pr-2">
                                Property Listings
                            </h2>

                            {/* "All listings" Tab */}
                            <button
                                type="button"
                                onClick={() => setUserTypeFilter('all')}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    userTypeFilter === 'all'
                                        ? 'bg-[#FA6400] text-white shadow-xs'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                }`}
                            >
                                <span>All listings</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${userTypeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>
                                    {allCount}
                                </span>
                            </button>

                            {/* "Landlord" Tab */}
                            <button
                                type="button"
                                onClick={() => setUserTypeFilter('landlord')}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    userTypeFilter === 'landlord'
                                        ? 'bg-[#FA6400] text-white shadow-xs'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                }`}
                            >
                                <span>Landlord</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${userTypeFilter === 'landlord' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>
                                    {landlordCount}
                                </span>
                            </button>

                            {/* "Agent" Tab */}
                            <button
                                type="button"
                                onClick={() => setUserTypeFilter('agent')}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    userTypeFilter === 'agent'
                                        ? 'bg-[#FA6400] text-white shadow-xs'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                }`}
                            >
                                <span>Agent</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${userTypeFilter === 'agent' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700 font-bold'}`}>
                                    {agentCount}
                                </span>
                            </button>
                        </div>

                        {/* Right Filter Dropdowns */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-1.5 outline-none hover:border-stone-300 cursor-pointer"
                                >
                                    <option value="all">Status: All</option>
                                    <option value="VERIFIED">Status: Verified</option>
                                    <option value="PENDING">Status: Pending</option>
                                    <option value="REJECTED">Status: Rejected</option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div className="relative">
                                <select
                                    className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-1.5 outline-none hover:border-stone-300 cursor-pointer"
                                >
                                    <option value="all">Location: All</option>
                                    <option value="ilorin">Ilorin</option>
                                    <option value="malete">Malete</option>
                                </select>
                            </div>

                            {/* Date range Filter */}
                            <div className="relative">
                                <select
                                    className="text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-1.5 outline-none hover:border-stone-300 cursor-pointer"
                                >
                                    <option value="all">Date range</option>
                                    <option value="today">Today</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>

                            {/* Show All */}
                            <button
                                type="button"
                                onClick={() => {
                                    setUserTypeFilter('all');
                                    setStatusFilter('all');
                                    setSearchQuery('');
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-[#FA6400] transition-colors ml-1"
                            >
                                <span>Show All</span>
                                <FiArrowUpRight className="text-sm" />
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-stone-400 border-b border-stone-100">
                                    <th className="py-3 px-3">ID No</th>
                                    <th className="py-3 px-3">Product</th>
                                    <th className="py-3 px-3">User type</th>
                                    <th className="py-3 px-3">Name</th>
                                    <th className="py-3 px-3">Date listed</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                                            Loading applications...
                                        </td>
                                    </tr>
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 text-2xl mb-1">
                                                    <FiFileText />
                                                </div>
                                                <p className="text-sm font-semibold text-stone-700">No applications found</p>
                                                <p className="text-xs text-stone-400 leading-relaxed">
                                                    {searchQuery || statusFilter !== 'all' || userTypeFilter !== 'all'
                                                        ? 'No verification records match your active search or filter criteria.'
                                                        : 'Landlord and agent document submissions will appear here for review and verification.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => {
                                        const roleDisplay = (app.userRole || 'Landlord').toLowerCase() === 'agent' ? 'Agent' : 'Landlord';
                                        const statusStr = app.status || 'PENDING';

                                        return (
                                            <tr key={app.id} className="hover:bg-stone-50/70 transition-colors group">
                                                {/* ID No */}
                                                <td className="py-4 px-3 font-medium text-stone-600">
                                                    {app.idNo || String(app.id).padStart(6, '0')}
                                                </td>

                                                {/* Product */}
                                                <td className="py-4 px-3 font-semibold text-stone-800">
                                                    {app.propertyTitle || 'General Landlord KYC'}
                                                </td>

                                                {/* User Type */}
                                                <td className="py-4 px-3 font-medium text-stone-600">
                                                    {roleDisplay}
                                                </td>

                                                {/* Name */}
                                                <td className="py-4 px-3 font-semibold text-stone-900">
                                                    {app.userName || 'Unassigned User'}
                                                </td>

                                                {/* Date Listed */}
                                                <td className="py-4 px-3 text-stone-500 font-medium">
                                                    {formatDate(app.createdAt)}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-3">
                                                    {statusStr === 'VERIFIED' && (
                                                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/50">
                                                            Verified
                                                        </span>
                                                    )}
                                                    {statusStr === 'REJECTED' && (
                                                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#FEECEB] text-[#F04438] border border-rose-200/50">
                                                            Rejected
                                                        </span>
                                                    )}
                                                    {statusStr === 'PENDING' && (
                                                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#FEF6EE] text-[#F79009] border border-amber-200/50">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action Button: "View >" */}
                                                <td className="py-4 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setShowRejectInput(false);
                                                            setRejectionReason('');
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#ECE9FE] hover:bg-[#DDD8FE] text-[#7F56D9] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                                                    >
                                                        <span>View</span>
                                                        <FiChevronRight className="text-sm" />
                                                    </button>
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

            {/* Document Review & Approval Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 flex flex-col animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
                            <div>
                                <span className="text-[11px] font-bold text-[#FA6400] uppercase tracking-wider block">
                                    Landlord Verification Review
                                </span>
                                <h3 className="text-lg font-bold text-stone-900 font-poppins">
                                    Application #{selectedApp.idNo || String(selectedApp.id).padStart(6, '0')} - {selectedApp.userName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedApp(null)}
                                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                            >
                                <IoCloseOutline className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Landlord Profile & Status Pill */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FFF2EA] text-[#FA6400] ring-2 ring-white shrink-0 flex items-center justify-center font-bold text-sm">
                                        {selectedApp.selfieUrl ? (
                                            <img
                                                src={selectedApp.selfieUrl}
                                                alt={selectedApp.userName || 'Applicant'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {selectedApp.userName ? selectedApp.userName.substring(0, 2).toUpperCase() : 'KY'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-stone-900">{selectedApp.userName || 'Unassigned User'}</h4>
                                        <p className="text-xs text-stone-500">{selectedApp.userEmail || 'No email'} &bull; {selectedApp.userPhone || 'No phone'}</p>
                                        <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Role: {selectedApp.userRole || 'LANDLORD'}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] text-stone-400 font-medium block mb-1">Status</span>
                                    {selectedApp.status === 'VERIFIED' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/50">
                                            <FiCheckCircle /> Verified
                                        </span>
                                    )}
                                    {selectedApp.status === 'REJECTED' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#FEECEB] text-[#F04438] border border-rose-200/50">
                                            <FiXCircle /> Rejected
                                        </span>
                                    )}
                                    {selectedApp.status === 'PENDING' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#FEF6EE] text-[#F79009] border border-amber-200/50">
                                            Pending Review
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Note if present */}
                            {selectedApp.rejectionReason && (
                                <div className="p-4 bg-rose-50 border border-rose-200/70 rounded-2xl text-xs text-rose-800">
                                    <strong className="block font-semibold mb-1">Rejection Remarks:</strong>
                                    <span>{selectedApp.rejectionReason}</span>
                                </div>
                            )}

                            {/* Property Details if linked */}
                            {selectedApp.propertyTitle && (
                                <div className="p-4 bg-white border border-stone-200/70 rounded-2xl shadow-xs">
                                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                        Associated Property Listing
                                    </span>
                                    <p className="text-sm font-semibold text-stone-900">{selectedApp.propertyTitle}</p>
                                    {selectedApp.propertyLocation && (
                                        <p className="text-xs text-stone-500 mt-0.5">{selectedApp.propertyLocation}</p>
                                    )}
                                </div>
                            )}

                            {/* Uploaded Documents Grid */}
                            <div>
                                <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                                    <HiOutlineShieldCheck className="text-primary text-base" />
                                    <span>Submitted Verification Documents</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 1. Normal ID Verification */}
                                    <div className="p-3.5 border border-stone-200/80 rounded-2xl bg-stone-50/50 flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                                                <HiOutlineShieldCheck className="text-[#FA6400]" /> 1. Normal ID Verification
                                            </span>
                                            {(selectedApp.idDocumentUrl || selectedApp.selfieUrl) ? (
                                                <a
                                                    href={selectedApp.idDocumentUrl || selectedApp.selfieUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <FiExternalLink className="text-[10px]" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 font-medium">Not provided</span>
                                            )}
                                        </div>
                                        {(selectedApp.idDocumentUrl || selectedApp.selfieUrl) ? (
                                            <div className="w-full h-32 rounded-xl overflow-hidden bg-black/5 border border-stone-200/40">
                                                <img
                                                    src={selectedApp.idDocumentUrl || selectedApp.selfieUrl}
                                                    alt="ID Verification"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 rounded-xl bg-stone-100/70 border border-stone-200/60 flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
                                                <FiImage className="text-2xl text-stone-300" />
                                                <span className="text-xs font-medium">No ID document uploaded</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Photo / Property Proof of Ownership / Caretaker Authorisation */}
                                    <div className="p-3.5 border border-stone-200/80 rounded-2xl bg-stone-50/50 flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                                                <FiFileText className="text-[#FA6400]" /> 2. Proof of Ownership / Caretaker Auth
                                            </span>
                                            {(selectedApp.ownershipProofUrl || selectedApp.cofoUrl || selectedApp.deedUrl) ? (
                                                <a
                                                    href={selectedApp.ownershipProofUrl || selectedApp.cofoUrl || selectedApp.deedUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <FiExternalLink className="text-[10px]" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 font-medium">Not provided</span>
                                            )}
                                        </div>
                                        {(selectedApp.ownershipProofUrl || selectedApp.cofoUrl || selectedApp.deedUrl) ? (
                                            <div className="w-full h-32 rounded-xl overflow-hidden bg-black/5 border border-stone-200/40">
                                                <img
                                                    src={selectedApp.ownershipProofUrl || selectedApp.cofoUrl || selectedApp.deedUrl}
                                                    alt="Proof of Ownership or Caretaker Auth"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 rounded-xl bg-stone-100/70 border border-stone-200/60 flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
                                                <FiFileText className="text-2xl text-stone-300" />
                                                <span className="text-xs font-medium">No ownership or caretaker doc</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Property Address Proof Doc */}
                                    <div className="p-3.5 border border-stone-200/80 rounded-2xl bg-stone-50/50 flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                                                <FiFileText className="text-[#FA6400]" /> 3. Property Address Proof Doc
                                            </span>
                                            {(selectedApp.addressProofUrl || selectedApp.surveyPlanUrl) ? (
                                                <a
                                                    href={selectedApp.addressProofUrl || selectedApp.surveyPlanUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <FiExternalLink className="text-[10px]" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 font-medium">Not provided</span>
                                            )}
                                        </div>
                                        {(selectedApp.addressProofUrl || selectedApp.surveyPlanUrl) ? (
                                            <div className="w-full h-32 rounded-xl overflow-hidden bg-black/5 border border-stone-200/40">
                                                <img
                                                    src={selectedApp.addressProofUrl || selectedApp.surveyPlanUrl}
                                                    alt="Property Address Proof"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 rounded-xl bg-stone-100/70 border border-stone-200/60 flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
                                                <FiFileText className="text-2xl text-stone-300" />
                                                <span className="text-xs font-medium">No address proof uploaded</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. Hyve Landlord Agreement Signed */}
                                    <div className="p-3.5 border border-stone-200/80 rounded-2xl bg-stone-50/50 flex flex-col justify-between">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                                                <FiFileText className="text-[#FA6400]" /> 4. Hyve Agreement (Signed)
                                            </span>
                                            {(selectedApp.signedAgreementUrl || selectedApp.cacUrl) ? (
                                                <a
                                                    href={selectedApp.signedAgreementUrl || selectedApp.cacUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <FiExternalLink className="text-[10px]" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-stone-400 font-medium">Not provided</span>
                                            )}
                                        </div>
                                        {(selectedApp.signedAgreementUrl || selectedApp.cacUrl) ? (
                                            <div className="w-full h-32 rounded-xl overflow-hidden bg-black/5 border border-stone-200/40">
                                                <img
                                                    src={selectedApp.signedAgreementUrl || selectedApp.cacUrl}
                                                    alt="Signed Hyve Landlord Agreement"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 rounded-xl bg-stone-100/70 border border-stone-200/60 flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
                                                <FiFileText className="text-2xl text-stone-300" />
                                                <span className="text-xs font-medium">No signed agreement uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rejection input box if triggered */}
                            {showRejectInput && (
                                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                                    <label className="text-xs font-semibold text-stone-800 block">
                                        Reason for Rejection (visible to landlord)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g., The Certificate of Occupancy is unreadable or expired. Please upload a clear color scan."
                                        className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-stone-400"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectInput(false)}
                                            className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReject}
                                            disabled={isActionLoading || !rejectionReason.trim()}
                                            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="p-6 border-t border-stone-100 flex items-center justify-between gap-3 bg-stone-50/50 rounded-b-3xl">
                            <div>
                                <span className="text-xs text-stone-400">
                                    {selectedApp.status === 'VERIFIED' ? 'Account verified and approved' : 'Review all documents carefully before approval'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedApp.status !== 'REJECTED' && !showRejectInput && (
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectInput(true)}
                                        disabled={isActionLoading}
                                        className="px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all shadow-xs"
                                    >
                                        Reject
                                    </button>
                                )}

                                {selectedApp.status !== 'VERIFIED' && (
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={isActionLoading}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                    >
                                        <FiCheckCircle />
                                        <span>{isActionLoading ? 'Approving...' : 'Approve Landlord'}</span>
                                    </button>
                                )}

                                {selectedApp.status === 'VERIFIED' && (
                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100/70 text-emerald-800 text-xs font-bold">
                                        <FiCheckCircle /> Verified Badge Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUserManagement;
