import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import {
    FiSearch,
    FiUser,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiAlertCircle,
    FiEye,
    FiPhone,
    FiMail,
    FiCalendar,
    FiMapPin,
    FiShield,
    FiActivity,
    FiLayers,
    FiInfo,
    FiRefreshCw,
    FiArrowUpRight,
    FiCheck
} from 'react-icons/fi';
import { HiUsers, HiOutlineAcademicCap, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { BsPersonBadgeFill } from 'react-icons/bs';
import { IoCloseOutline } from 'react-icons/io5';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Primary Tab: 'all', 'tenant', 'landlord', 'agent'
    const [roleTab, setRoleTab] = useState('all');

    // Secondary Filters
    const [kycFilter, setKycFilter] = useState('all'); // all, VERIFIED, PENDING, NOT_VERIFIED, REJECTED
    const [processFilter, setProcessFilter] = useState('all'); // all, IN_INSPECTION, IN_PAYMENT, IN_QUEUE, IDLE
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for viewing user details
    const [selectedUser, setSelectedUser] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await config.getAPI({
                url: '/api/v1/admin/users'
            });

            if (res?.success && Array.isArray(res?.data)) {
                setUsers(res.data);
            } else {
                setUsers([]);
                if (res?.message) setError(res.message);
            }
        } catch (err) {
            console.error('Backend users unavailable:', err);
            setError(err?.message || 'Unable to connect to backend server to load users.');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateKycStatus = async (userId, newStatus) => {
        setIsActionLoading(true);
        try {
            await config.putAPI({
                url: `/api/v1/admin/users/${userId}/kyc-status`,
                params: { status: newStatus }
            });

            hyveSuccess('KYC Updated', `User KYC status updated to ${newStatus}.`);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, kycStatus: newStatus, kycStatusDisplay: newStatus } : u))
            );
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser((prev) => ({ ...prev, kycStatus: newStatus, kycStatusDisplay: newStatus }));
            }
        } catch (err) {
            console.error('Failed to update KYC status:', err);
            hyveError('KYC Update Failed', err?.message || 'Could not update user KYC status on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Tab counts derived directly from live database users
    const allUsersTotal = users.length;
    const tenantsTotal = users.filter((u) => u.role === 'STUDENT' || u.roleDisplay === 'Tenant').length;
    const landlordsTotal = users.filter((u) => u.role === 'LANDLORD' && u.roleDisplay === 'Landlord').length;
    const agentsTotal = users.filter((u) => u.roleDisplay === 'Agent').length;

    // Filter users dynamically by selected role, KYC status, and search query
    const filteredUsers = users.filter((u) => {
        if (roleTab !== 'all') {
            if (roleTab === 'tenant' && u.role !== 'STUDENT' && u.roleDisplay !== 'Tenant') return false;
            if (roleTab === 'landlord' && (u.role !== 'LANDLORD' || u.roleDisplay !== 'Landlord')) return false;
            if (roleTab === 'agent' && u.roleDisplay !== 'Agent') return false;
        }
        if (kycFilter !== 'all') {
            if ((u.kycStatus || '').toUpperCase() !== kycFilter.toUpperCase()) return false;
        }
        if (processFilter !== 'all') {
            if ((u.currentProcess || '').toUpperCase() !== processFilter.toUpperCase()) return false;
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const nameMatch = (u.name || '').toLowerCase().includes(q);
            const emailMatch = (u.email || '').toLowerCase().includes(q);
            const phoneMatch = (u.phone || '').toLowerCase().includes(q);
            if (!nameMatch && !emailMatch && !phoneMatch) return false;
        }
        return true;
    });

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

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
                            onClick={fetchUsers}
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
                        <span className="text-xs font-semibold text-stone-500">All Registered Users</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-poppins">
                                {allUsersTotal}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">Platform Total</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Tenants (Students)</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#FA6400] font-poppins">
                                {tenantsTotal}
                            </span>
                            <span className="text-xs text-[#FA6400] bg-[#FFF2EA] px-2 py-0.5 rounded-full font-bold">
                                Students
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Landlords & Hosts</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#7F56D9] font-poppins">
                                {landlordsTotal}
                            </span>
                            <span className="text-xs text-purple-700 bg-[#F4EBFF] px-2 py-0.5 rounded-full font-bold">
                                Property Owners
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Agents & Caretakers</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#12B76A] font-poppins">
                                {agentsTotal}
                            </span>
                            <span className="text-xs text-emerald-700 bg-[#E6F8EF] px-2 py-0.5 rounded-full font-bold">
                                On-ground
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Main Card with Role Tabs, Filters, and Users Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Header bar with Role separation tabs */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                        {/* Role Separation Tabs */}
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { label: 'All Users', value: 'all', count: allUsersTotal },
                                { label: 'Tenants (Students)', value: 'tenant', count: tenantsTotal },
                                { label: 'Landlords', value: 'landlord', count: landlordsTotal },
                                { label: 'Agents', value: 'agent', count: agentsTotal }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setRoleTab(tab.value)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                        roleTab === tab.value
                                            ? 'bg-[#FA6400] text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        roleTab === tab.value ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Secondary Filter Dropdowns */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* KYC Filter */}
                            <select
                                value={kycFilter}
                                onChange={(e) => setKycFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200/70 text-stone-800 rounded-full border-none outline-none cursor-pointer transition-colors"
                            >
                                <option value="all">KYC: All</option>
                                <option value="VERIFIED">KYC: Verified</option>
                                <option value="PENDING">KYC: Pending</option>
                                <option value="NOT_VERIFIED">KYC: Unverified</option>
                                <option value="REJECTED">KYC: Rejected</option>
                            </select>

                            {/* Process Status Filter */}
                            <select
                                value={processFilter}
                                onChange={(e) => setProcessFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200/70 text-stone-800 rounded-full border-none outline-none cursor-pointer transition-colors"
                            >
                                <option value="all">Process: All Stages</option>
                                <option value="IN_INSPECTION">In Inspection</option>
                                <option value="IN_PAYMENT">In Payment / Escrow</option>
                                <option value="IN_QUEUE">In Queue</option>
                                <option value="ACTIVE_LANDLORD">Active Landlord</option>
                                <option value="IDLE">Idle / Browsing</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Role</th>
                                    <th className="pb-3">Contact</th>
                                    <th className="pb-3">KYC Status</th>
                                    <th className="pb-3">Active Process / Stage</th>
                                    <th className="pb-3">Last Activity</th>
                                    <th className="pb-3 text-right pr-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="w-8 h-8 border-2 border-[#FA6400]/20 border-t-[#FA6400] rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-xs text-stone-500 font-medium">Loading platform users...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-stone-400 text-xs sm:text-sm">
                                            No users match your selected role or filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const kyc = (u.kycStatus || 'NOT_VERIFIED').toUpperCase();
                                        const proc = u.currentProcess || 'IDLE';

                                        return (
                                            <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                                                {/* User Info */}
                                                <td className="py-4 pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200/50 flex items-center justify-center font-bold text-stone-700 text-xs shrink-0">
                                                            {getInitials(u.name)}
                                                        </div>
                                                        <div className="max-w-[190px]">
                                                            <p className="text-xs font-bold text-stone-900 truncate" title={u.name}>
                                                                {u.name}
                                                            </p>
                                                            <p className="text-[11px] text-stone-400 truncate">
                                                                {u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-4 text-xs">
                                                    {u.roleDisplay === 'Tenant' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF2EA] text-[#FA6400]">
                                                            <HiOutlineAcademicCap className="text-xs" />
                                                            <span>Tenant</span>
                                                        </span>
                                                    )}
                                                    {u.roleDisplay === 'Landlord' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F4EBFF] text-[#7F56D9]">
                                                            <HiOutlineBuildingOffice2 className="text-xs" />
                                                            <span>Landlord</span>
                                                        </span>
                                                    )}
                                                    {u.roleDisplay === 'Agent' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A]">
                                                            <BsPersonBadgeFill className="text-xs" />
                                                            <span>Agent</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Contact */}
                                                <td className="py-4 text-xs text-stone-700 font-medium">
                                                    {u.phone || '-'}
                                                </td>

                                                {/* Basic KYC Status */}
                                                <td className="py-4">
                                                    {kyc === 'VERIFIED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/60">
                                                            <FiCheckCircle className="text-xs" />
                                                            <span>Verified</span>
                                                        </span>
                                                    )}
                                                    {kyc === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FEF6EE] text-[#F79009] border border-amber-200/60">
                                                            <FiClock className="text-xs" />
                                                            <span>Pending</span>
                                                        </span>
                                                    )}
                                                    {kyc === 'NOT_VERIFIED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                                                            <span>Unverified</span>
                                                        </span>
                                                    )}
                                                    {kyc === 'REJECTED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FEECEB] text-[#F04438] border border-rose-200/60">
                                                            <FiXCircle className="text-xs" />
                                                            <span>Rejected</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Live Process / Inspection / Payment Stage */}
                                                <td className="py-4 text-xs">
                                                    <div className="max-w-[240px]">
                                                        {proc === 'IN_INSPECTION' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200/60" title={u.processTitle}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                                <span className="truncate">Inspection Booked</span>
                                                            </span>
                                                        )}
                                                        {proc === 'IN_PAYMENT' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200/60" title={u.processTitle}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                                                <span className="truncate">In Payment / Escrow</span>
                                                            </span>
                                                        )}
                                                        {proc === 'IN_QUEUE' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200/60" title={u.processTitle}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                                                                <span className="truncate">In Queue (#1)</span>
                                                            </span>
                                                        )}
                                                        {proc === 'ACTIVE_LANDLORD' && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200/60" title={u.processTitle}>
                                                                <span>{u.propertiesCount || 1} Active Listings</span>
                                                            </span>
                                                        )}
                                                        {proc === 'IDLE' && (
                                                            <span className="text-stone-400 text-[11px] font-medium">
                                                                Browsing / Idle
                                                            </span>
                                                        )}
                                                        {u.processTitle && proc !== 'IDLE' && (
                                                            <p className="text-[10px] text-stone-500 mt-1 truncate" title={u.processTitle}>
                                                                {u.processTitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Last Activity Date */}
                                                <td className="py-4 text-xs font-semibold text-stone-600">
                                                    <span className={`inline-flex items-center gap-1.5 ${
                                                        u.lastActivityFormatted === 'Active now'
                                                            ? 'text-emerald-600 font-bold'
                                                            : 'text-stone-600'
                                                    }`}>
                                                        {u.lastActivityFormatted === 'Active now' && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        )}
                                                        <span>{u.lastActivityFormatted || 'Offline'}</span>
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Quick Verify Button if pending */}
                                                        {kyc !== 'VERIFIED' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateKycStatus(u.id, 'VERIFIED')}
                                                                disabled={isActionLoading}
                                                                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                                                title="Verify KYC"
                                                            >
                                                                <FiCheck className="text-xs" />
                                                                <span>Verify KYC</span>
                                                            </button>
                                                        )}

                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedUser(u)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer"
                                                            title="Inspect User Details"
                                                        >
                                                            <FiEye />
                                                        </button>
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

            {/* User Detail Slide-Over Modal */}
            {selectedUser && (
                <div
                    className="fixed inset-0 z-[500] flex items-center justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
                    onClick={() => setSelectedUser(null)}
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
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            selectedUser.roleDisplay === 'Tenant'
                                                ? 'bg-[#FFF2EA] text-[#FA6400]'
                                                : 'bg-[#F4EBFF] text-[#7F56D9]'
                                        }`}>
                                            {selectedUser.roleDisplay}
                                        </span>
                                        <span className="text-xs font-semibold text-stone-400">
                                            ID #{selectedUser.id}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 font-poppins mt-1">
                                        {selectedUser.name}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Current Process / Stage Card */}
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <FiActivity className="text-[#FA6400]" />
                                    <span>Live Process Status</span>
                                </h4>
                                <div className="p-3 bg-white rounded-xl border border-stone-200/70 text-xs">
                                    <div className="flex items-center justify-between font-bold mb-1">
                                        <span className="text-stone-900">
                                            {selectedUser.currentProcess === 'IN_INSPECTION'
                                                ? 'Tour Inspection Booked'
                                                : selectedUser.currentProcess === 'IN_PAYMENT'
                                                ? 'Active Escrow Payment'
                                                : selectedUser.currentProcess === 'IN_QUEUE'
                                                ? 'Queued for Rental'
                                                : selectedUser.currentProcess === 'ACTIVE_LANDLORD'
                                                ? 'Active Platform Host'
                                                : 'Idle / Exploring'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            selectedUser.currentProcess === 'IN_INSPECTION'
                                                ? 'bg-blue-50 text-blue-700'
                                                : selectedUser.currentProcess === 'IN_PAYMENT'
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                        }`}>
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-600 leading-relaxed">
                                        {selectedUser.processTitle || 'User currently exploring housing units.'}
                                    </p>
                                </div>
                            </div>

                            {/* User Contact & Activity Info */}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl text-xs">
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Email Address</span>
                                    <span className="font-bold text-stone-900 truncate block">{selectedUser.email}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Phone Number</span>
                                    <span className="font-bold text-stone-900">{selectedUser.phone || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Last Activity</span>
                                    <span className="font-bold text-stone-900">{selectedUser.lastActivityFormatted || 'Offline'}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Member Since</span>
                                    <span className="font-bold text-stone-900">
                                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* KYC Verification Card */}
                            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                                        <FiShield className="text-emerald-600" />
                                        <span>Identity & KYC Verification</span>
                                    </h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        selectedUser.kycStatus === 'VERIFIED'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : selectedUser.kycStatus === 'PENDING'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-stone-200 text-stone-700'
                                    }`}>
                                        {selectedUser.kycStatus || 'NOT_VERIFIED'}
                                    </span>
                                </div>

                                <p className="text-xs text-stone-600">
                                    {selectedUser.kycStatus === 'VERIFIED'
                                        ? 'Government identification and student/landlord credentials verified by Hyve Haven compliance team.'
                                        : 'Identity documents submitted and awaiting administrative approval or verification review.'}
                                </p>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                            {selectedUser.kycStatus !== 'VERIFIED' ? (
                                <button
                                    type="button"
                                    onClick={() => handleUpdateKycStatus(selectedUser.id, 'VERIFIED')}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-[#12B76A] hover:bg-[#0ea35c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle />
                                    <span>Approve KYC Verification</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleUpdateKycStatus(selectedUser.id, 'REJECTED')}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiXCircle />
                                    <span>Revoke Verification</span>
                                </button>
                            )}

                            <a
                                href={`mailto:${selectedUser.email}`}
                                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors text-center"
                            >
                                Contact User
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUserManagement;
