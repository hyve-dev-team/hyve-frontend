import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

import {
    FiSearch,
    FiFilter,
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiTrash2,
    FiExternalLink,
    FiInfo,
    FiRefreshCw,
    FiCalendar,
    FiMapPin,
    FiUser,
    FiPhone,
    FiMail,
    FiLayers,
    FiFileText,
    FiClock,
    FiShield,
    FiUserPlus,
    FiAlertCircle,
    FiCheck
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { RiBuilding4Line, RiShieldCheckFill } from 'react-icons/ri';
import { IoCloseOutline } from 'react-icons/io5';

const AdminPropertyManagement = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all'); // all, ACTIVE, INACTIVE, RENTED
    const [verificationFilter, setVerificationFilter] = useState('all'); // all, VERIFIED, PENDING, NOT_VERIFIED, REJECTED
    const [inspectionFilter, setInspectionFilter] = useState('all'); // all, ACTIVE, NONE
    const [typeFilter, setTypeFilter] = useState('all'); // all, APARTMENT, ROOM, HOUSE, STUDIO
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for viewing property details
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Modal state for assigning agent
    const [assignAgentProperty, setAssignAgentProperty] = useState(null);
    const [agentNameInput, setAgentNameInput] = useState('');
    const [agentPhoneInput, setAgentPhoneInput] = useState('');
    const [agentRoleInput, setAgentRoleInput] = useState('Agent/Caretaker');

    useEffect(() => {
        fetchProperties();
    }, [statusFilter, verificationFilter, inspectionFilter, typeFilter, searchQuery]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.propertyType = typeFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await config.getAPI({
                url: '/api/v1/admin/properties',
                params
            });

            if (res?.success && Array.isArray(res?.data)) {
                setProperties(res.data);
            } else {
                setProperties([]);
                if (res?.message) setError(res.message);
            }
        } catch (err) {
            console.error('Failed to load admin properties:', err);
            setError(err?.message || 'Unable to connect to backend server to load properties.');
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 1. Mark as Verified action
    const handleMarkAsVerified = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await config.putAPI({
                url: `/api/v1/admin/properties/${id}/verification-status`,
                params: { status: 'VERIFIED' }
            });

            hyveSuccess('Listing Verified', 'Property status marked as Verified with platform trust badge.');
            setProperties((prev) =>
                prev.map((p) => (p.id === id ? { ...p, verificationStatus: 'VERIFIED', documentStatus: 'COMPLETE' } : p))
            );
            if (selectedProperty && selectedProperty.id === id) {
                setSelectedProperty((prev) => ({ ...prev, verificationStatus: 'VERIFIED', documentStatus: 'COMPLETE' }));
            }
        } catch (err) {
            console.error('Failed to mark property as verified:', err);
            hyveError('Verification Failed', err?.message || 'Could not verify property on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // 2. Suspend / Activate action
    const handleToggleSuspend = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
        setIsActionLoading(true);
        try {
            await config.putAPI({
                url: `/api/v1/admin/properties/${id}/status`,
                params: { status: nextStatus }
            });

            const msg = nextStatus === 'INACTIVE' ? 'Listing suspended and hidden from public search.' : 'Listing restored and active.';
            hyveSuccess(nextStatus === 'INACTIVE' ? 'Listing Suspended' : 'Listing Activated', msg);
            setProperties((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
            );
            if (selectedProperty && selectedProperty.id === id) {
                setSelectedProperty((prev) => ({ ...prev, status: nextStatus }));
            }
        } catch (err) {
            console.error('Failed to update property status:', err);
            hyveError('Action Failed', err?.message || 'Could not update listing status on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // 3. Assign Agent action
    const handleOpenAssignModal = (property) => {
        setAssignAgentProperty(property);
        setAgentNameInput(property.assignedAgentName || '');
        setAgentPhoneInput(property.assignedAgentPhone || '');
        setAgentRoleInput('Agent/Caretaker');
    };

    const handleSaveAgent = async (e) => {
        e.preventDefault();
        if (!assignAgentProperty) return;
        if (!agentNameInput.trim() || !agentPhoneInput.trim()) {
            hyveError('Required Fields', 'Please enter both agent name and WhatsApp number.');
            return;
        }

        setIsActionLoading(true);
        try {
            await config.postAPI({
                url: `/api/v1/admin/properties/${assignAgentProperty.id}/assign-agent`,
                params: {
                    fullName: agentNameInput.trim(),
                    whatsappNumber: agentPhoneInput.trim(),
                    roleTitle: agentRoleInput
                }
            });

            hyveSuccess('Agent Assigned', `${agentNameInput} assigned as caretaker for ${assignAgentProperty.title}`);
            setProperties((prev) =>
                prev.map((p) =>
                    p.id === assignAgentProperty.id
                        ? { ...p, assignedAgentName: agentNameInput.trim(), assignedAgentPhone: agentPhoneInput.trim() }
                        : p
                )
            );
            if (selectedProperty && selectedProperty.id === assignAgentProperty.id) {
                setSelectedProperty((prev) => ({
                    ...prev,
                    assignedAgentName: agentNameInput.trim(),
                    assignedAgentPhone: agentPhoneInput.trim()
                }));
            }
            setAssignAgentProperty(null);
        } catch (err) {
            console.error('Failed to assign agent:', err);
            hyveError('Assignment Failed', err?.message || 'Could not assign agent on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteProperty = async (id) => {
        setIsActionLoading(true);
        try {
            await config.deleteAPI({
                url: `/api/v1/admin/properties/${id}`
            });
            hyveSuccess('Property Deleted', 'Listing removed from the platform.');
            setConfirmDeleteId(null);
            if (selectedProperty?.id === id) {
                setSelectedProperty(null);
            }
            fetchProperties();
        } catch (err) {
            console.error('Failed to delete property:', err);
            hyveError('Delete Failed', err?.message || 'Could not delete property on server.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Client-side filtering for verification and inspection
    const filteredProperties = properties.filter((p) => {
        if (verificationFilter !== 'all') {
            const v = (p.verificationStatus || 'PENDING').toUpperCase();
            if (v !== verificationFilter) return false;
        }
        if (inspectionFilter !== 'all') {
            const ins = (p.inspectionStatus || 'NONE').toUpperCase();
            if (inspectionFilter === 'ACTIVE' && (ins === 'NONE' || ins === 'COMPLETED')) return false;
            if (inspectionFilter === 'NONE' && ins !== 'NONE') return false;
        }
        return true;
    });

    // Metric counts
    const totalCount = properties.length;
    const verifiedCount = properties.filter((p) => (p.verificationStatus || '').toUpperCase() === 'VERIFIED').length;
    const pendingVerifCount = properties.filter((p) => (p.verificationStatus || 'PENDING').toUpperCase() === 'PENDING').length;
    const suspendedCount = properties.filter((p) => p.status === 'INACTIVE').length;

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

    const getCleanWhatsAppUrl = (phone) => {
        if (!phone) return '#';
        const cleaned = phone.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleaned}`;
    };

    return (
        <AdminLayout>
            <AdminHeader
                title="Property Management"
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
                            onClick={fetchProperties}
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
                        <span className="text-xs font-semibold text-stone-500">Total Listings</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : totalCount}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">All Units</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Verified Listings</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#12B76A] font-poppins">
                                {isLoading ? '-' : verifiedCount}
                            </span>
                            <span className="text-xs text-emerald-700 bg-[#E6F8EF] px-2 py-0.5 rounded-full font-bold">
                                Trust Badge
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Pending Verification</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#F79009] font-poppins">
                                {isLoading ? '-' : pendingVerifCount}
                            </span>
                            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                                Review Queue
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Suspended / Hidden</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#F04438] font-poppins">
                                {isLoading ? '-' : suspendedCount}
                            </span>
                            <span className="text-xs text-red-600 bg-[#FEECEB] px-2 py-0.5 rounded-full font-bold">
                                Suspended
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Main Card with Search, Filter Tabs, and Property Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Header bar with filters */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                        <div>
                            <h2 className="text-lg font-bold text-stone-900 font-poppins">Platform Property Listings</h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Verify documents, monitor inspections, manage caretakers, and moderate listing statuses.
                            </p>
                        </div>

                        {/* Filter controls */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Verification Filter */}
                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200/70 text-stone-800 rounded-full border-none outline-none cursor-pointer transition-colors"
                            >
                                <option value="all">Verification: All</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="PENDING">Pending Review</option>
                                <option value="NOT_VERIFIED">Not Verified</option>
                                <option value="REJECTED">Rejected</option>
                            </select>

                            {/* Inspection Filter */}
                            <select
                                value={inspectionFilter}
                                onChange={(e) => setInspectionFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200/70 text-stone-800 rounded-full border-none outline-none cursor-pointer transition-colors"
                            >
                                <option value="all">Inspection: All</option>
                                <option value="ACTIVE">Has Active Tour</option>
                                <option value="NONE">No Tours</option>
                            </select>

                            {/* Listing status filter tabs */}
                            <div className="flex p-1 bg-stone-100 rounded-full text-xs font-semibold">
                                {[
                                    { label: 'All', value: 'all' },
                                    { label: 'Active', value: 'ACTIVE' },
                                    { label: 'Suspended', value: 'INACTIVE' },
                                    { label: 'Rented', value: 'RENTED' }
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
                    </div>

                    {/* Properties Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider font-bold text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 pl-2">Property</th>
                                    <th className="pb-3">Verification</th>
                                    <th className="pb-3">Inspection Status</th>
                                    <th className="pb-3">Assigned Agent / Caretaker</th>
                                    <th className="pb-3">Documents</th>
                                    <th className="pb-3">Listing</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="w-8 h-8 border-2 border-[#FA6400]/20 border-t-[#FA6400] rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-xs text-stone-500 font-medium">Loading property listings...</p>
                                        </td>
                                    </tr>
                                ) : filteredProperties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-stone-400 text-xs sm:text-sm">
                                            No properties match your current search or filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProperties.map((p) => {
                                        const thumb = p.images && p.images.length > 0 ? p.images[0] : '';
                                        const monthlyPrice = p.priceMonthly ? `₦ ${Number(p.priceMonthly).toLocaleString()}/mo` : null;

                                        const vStatus = (p.verificationStatus || 'PENDING').toUpperCase();
                                        const inspStatus = (p.inspectionStatus || 'NONE').toUpperCase();
                                        const isSuspended = p.status === 'INACTIVE';

                                        return (
                                            <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                                                {/* Property Title & Image */}
                                                <td className="py-4 pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/50 flex items-center justify-center text-stone-300">
                                                            {thumb ? (
                                                                <img
                                                                    src={thumb}
                                                                    alt={p.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <RiBuilding4Line className="text-xl" />
                                                            )}
                                                        </div>
                                                        <div className="max-w-[210px]">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FA6400]">
                                                                    {p.idNo || `HYV-${p.id}`}
                                                                </span>
                                                                <span className="text-[10px] text-stone-400 font-medium">
                                                                    • {p.propertyType || 'Apartment'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-stone-900 truncate" title={p.title}>
                                                                {p.title}
                                                            </p>
                                                            <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                                                                <FiMapPin className="text-stone-400 shrink-0 text-[10px]" />
                                                                <span>{p.location || 'Location not specified'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Verification Status */}
                                                <td className="py-4">
                                                    {vStatus === 'VERIFIED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/60">
                                                            <FiCheckCircle className="text-xs" />
                                                            <span>Verified</span>
                                                        </span>
                                                    )}
                                                    {vStatus === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FEF6EE] text-[#F79009] border border-amber-200/60">
                                                            <FiClock className="text-xs" />
                                                            <span>Pending</span>
                                                        </span>
                                                    )}
                                                    {vStatus === 'NOT_VERIFIED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                                                            <FiAlertCircle className="text-xs" />
                                                            <span>Not Verified</span>
                                                        </span>
                                                    )}
                                                    {vStatus === 'REJECTED' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FEECEB] text-[#F04438] border border-rose-200/60">
                                                            <FiXCircle className="text-xs" />
                                                            <span>Rejected</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Inspection Status */}
                                                <td className="py-4 text-xs">
                                                    {inspStatus === 'ACCEPTED' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                                                            <span>Tour Scheduled</span>
                                                        </span>
                                                    )}
                                                    {inspStatus === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/60">
                                                            <span>Tour Requested</span>
                                                        </span>
                                                    )}
                                                    {inspStatus === 'COMPLETED' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                                                            <span>Tour Completed</span>
                                                        </span>
                                                    )}
                                                    {inspStatus === 'NONE' && (
                                                        <span className="text-[11px] text-stone-400 font-medium">
                                                            No Tours
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Assigned Agent / Caretaker (Name + WhatsApp) */}
                                                <td className="py-4 text-xs">
                                                    {p.assignedAgentName ? (
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-stone-900">{p.assignedAgentName}</p>
                                                            {p.assignedAgentPhone ? (
                                                                <a
                                                                    href={getCleanWhatsAppUrl(p.assignedAgentPhone)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                                                                    title="Chat on WhatsApp"
                                                                >
                                                                    <FaWhatsapp className="text-emerald-500 text-xs" />
                                                                    <span>{p.assignedAgentPhone}</span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-[11px] text-stone-400">No phone</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenAssignModal(p)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-stone-300 hover:border-[#FA6400] text-stone-500 hover:text-[#FA6400] text-[11px] font-medium transition-colors cursor-pointer"
                                                        >
                                                            <FiUserPlus className="text-xs" />
                                                            <span>Assign Agent</span>
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Document Checklist status */}
                                                <td className="py-4 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProperty(p)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                                                        title="Click to view full checklist"
                                                    >
                                                        <FiFileText className="text-stone-400 text-xs" />
                                                        <span>
                                                            {p.documentStatus === 'COMPLETE'
                                                                ? 'Complete (4/4)'
                                                                : p.documentStatus === 'PENDING_REVIEW'
                                                                ? 'Review (2/4)'
                                                                : p.documentStatus === 'REJECTED'
                                                                ? 'Rejected (1/4)'
                                                                : 'Missing (0/4)'}
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* Listing Status */}
                                                <td className="py-4">
                                                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                        isSuspended
                                                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                            : p.status === 'RENTED'
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {isSuspended ? 'Suspended' : p.status}
                                                    </span>
                                                </td>

                                                {/* Simple Action Buttons */}
                                                <td className="py-4 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Mark as Verified (if not yet verified) */}
                                                        {vStatus !== 'VERIFIED' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMarkAsVerified(p.id)}
                                                                disabled={isActionLoading}
                                                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                                                title="Mark as Verified"
                                                            >
                                                                <FiCheck className="text-xs" />
                                                                <span>Verify</span>
                                                            </button>
                                                        )}

                                                        {/* Assign Agent button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenAssignModal(p)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer"
                                                            title="Assign / Change Agent"
                                                        >
                                                            <FiUserPlus />
                                                        </button>

                                                        {/* Suspend / Reactivate button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleSuspend(p.id, p.status)}
                                                            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                                                isSuspended
                                                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                                            }`}
                                                            title={isSuspended ? 'Reactivate Listing' : 'Suspend Listing'}
                                                        >
                                                            {isSuspended ? <FiCheckCircle /> : <FiXCircle />}
                                                        </button>

                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProperty(p)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer"
                                                            title="Inspect Property Details"
                                                        >
                                                            <FiEye />
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteId(p.id)}
                                                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors cursor-pointer"
                                                            title="Delete Listing"
                                                        >
                                                            <FiTrash2 />
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

            {/* Property Detail Slide-Over Modal */}
            {selectedProperty && (
                <div
                    className="fixed inset-0 z-[500] flex items-center justify-end bg-black/50 backdrop-blur-xs animate-fadeIn"
                    onClick={() => setSelectedProperty(null)}
                >
                    <div
                        className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#FA6400]">
                                            {selectedProperty.idNo || `HYV-${selectedProperty.id}`}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            selectedProperty.verificationStatus === 'VERIFIED'
                                                ? 'bg-[#E6F8EF] text-[#12B76A]'
                                                : selectedProperty.verificationStatus === 'PENDING'
                                                ? 'bg-[#FEF6EE] text-[#F79009]'
                                                : 'bg-stone-100 text-stone-600'
                                        }`}>
                                            {selectedProperty.verificationStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 font-poppins mt-1">
                                        {selectedProperty.title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProperty(null)}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Verification & Document Checklist Section */}
                            <div className="p-4 bg-stone-50 border border-stone-200/70 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                                        <FiShield className="text-[#FA6400]" />
                                        <span>Document Checklist Status</span>
                                    </h4>
                                    <span className="text-[11px] font-bold text-stone-500">
                                        {selectedProperty.documentsCount || 0} of {selectedProperty.documentsTotal || 4} Verified
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {(selectedProperty.documentChecklist || [
                                        'Certificate of Occupancy',
                                        'Survey Plan',
                                        'Landlord ID Verification',
                                        'Standard Tenancy Agreement'
                                    ]).map((docItem, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-100 text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="text-stone-400" />
                                                <span className="font-semibold text-stone-800">{docItem}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                docItem.includes('Verified') || docItem.includes('Signed') || docItem.includes('Complete')
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : docItem.includes('Review') || docItem.includes('Draft')
                                                    ? 'bg-amber-50 text-amber-700'
                                                    : 'bg-stone-100 text-stone-500'
                                            }`}>
                                                {docItem.includes('Verified') || docItem.includes('Signed')
                                                    ? 'Verified'
                                                    : docItem.includes('Review')
                                                    ? 'Pending'
                                                    : 'Missing'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Assigned Agent / Caretaker Card */}
                            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                                        <FiUser className="text-emerald-600" />
                                        <span>Assigned Agent / Caretaker</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenAssignModal(selectedProperty)}
                                        className="text-[11px] font-bold text-[#FA6400] hover:underline cursor-pointer"
                                    >
                                        Change Agent
                                    </button>
                                </div>

                                {selectedProperty.assignedAgentName ? (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                                        <div>
                                            <p className="text-xs font-bold text-stone-900">{selectedProperty.assignedAgentName}</p>
                                            <p className="text-[11px] text-stone-500">{selectedProperty.assignedAgentPhone || '-'}</p>
                                        </div>
                                        {selectedProperty.assignedAgentPhone && (
                                            <a
                                                href={getCleanWhatsAppUrl(selectedProperty.assignedAgentPhone)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                                            >
                                                <FaWhatsapp />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-3 bg-white/80 rounded-xl border border-dashed border-emerald-200">
                                        <p className="text-xs text-stone-500 mb-2">No agent or caretaker assigned yet.</p>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenAssignModal(selectedProperty)}
                                            className="px-3 py-1.5 bg-[#FA6400] text-white text-xs font-bold rounded-xl hover:bg-[#e05a00] transition-colors cursor-pointer"
                                        >
                                            Assign Caretaker Now
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Key Specs */}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl text-xs">
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Monthly Rent</span>
                                    <span className="font-bold text-stone-900">
                                        {selectedProperty.priceMonthly ? `₦ ${Number(selectedProperty.priceMonthly).toLocaleString()}` : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Annual Rent</span>
                                    <span className="font-bold text-stone-900">
                                        {selectedProperty.priceAnnually ? `₦ ${Number(selectedProperty.priceAnnually).toLocaleString()}` : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Property Type</span>
                                    <span className="font-bold text-stone-900">{selectedProperty.propertyType || 'Apartment'}</span>
                                </div>
                                <div>
                                    <span className="text-stone-400 block text-[11px]">Listing Status</span>
                                    <span className="font-bold text-stone-900">{selectedProperty.status}</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                                    Location
                                </h4>
                                <p className="text-xs text-stone-600 flex items-center gap-1.5">
                                    <FiMapPin className="text-[#FA6400]" />
                                    <span>{selectedProperty.location || 'Not specified'}</span>
                                </p>
                            </div>

                            {/* Landlord Contact Info */}
                            <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl space-y-2 text-xs">
                                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                    <FiUser className="text-[#FA6400]" />
                                    <span>Landlord Information</span>
                                </h4>
                                <div className="space-y-1 text-stone-700 text-xs">
                                    <p><strong>Name:</strong> {selectedProperty.landlordName || 'Verified Host'}</p>
                                    <p><strong>Email:</strong> {selectedProperty.landlordEmail || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedProperty.landlordPhone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                            {selectedProperty.verificationStatus !== 'VERIFIED' && (
                                <button
                                    type="button"
                                    onClick={() => handleMarkAsVerified(selectedProperty.id)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-[#12B76A] hover:bg-[#0ea35c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle />
                                    <span>Mark as Verified</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleOpenAssignModal(selectedProperty)}
                                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                                <FiUserPlus />
                                <span>Assign Agent</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleToggleSuspend(selectedProperty.id, selectedProperty.status)}
                                disabled={isActionLoading}
                                className={`px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    selectedProperty.status === 'INACTIVE'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                            >
                                {selectedProperty.status === 'INACTIVE' ? 'Activate' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Agent Dialog Modal */}
            {assignAgentProperty && (
                <div
                    className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
                    onClick={() => setAssignAgentProperty(null)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div>
                                <h3 className="text-base font-bold text-stone-900 font-poppins">
                                    Assign Agent / Caretaker
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">
                                    {assignAgentProperty.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAssignAgentProperty(null)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                            >
                                <IoCloseOutline className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAgent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Agent / Caretaker Full Name
                                </label>
                                <input
                                    type="text"
                                    value={agentNameInput}
                                    onChange={(e) => setAgentNameInput(e.target.value)}
                                    placeholder="e.g. Adebayo Salami"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-[#FA6400]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    WhatsApp Contact Number
                                </label>
                                <input
                                    type="text"
                                    value={agentPhoneInput}
                                    onChange={(e) => setAgentPhoneInput(e.target.value)}
                                    placeholder="e.g. +2348031234567"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-[#FA6400]"
                                />
                                <span className="text-[10px] text-stone-400 mt-0.5 block">
                                    Tenants will be able to reach this number directly on WhatsApp for scheduled inspections.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Role / Title
                                </label>
                                <select
                                    value={agentRoleInput}
                                    onChange={(e) => setAgentRoleInput(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-[#FA6400] bg-white cursor-pointer"
                                >
                                    <option value="Agent/Caretaker">Agent / Caretaker</option>
                                    <option value="Facility Manager">Facility Manager</option>
                                    <option value="Verified Host">Verified Host / Landlord</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setAssignAgentProperty(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="flex-1 py-2.5 rounded-xl bg-[#FA6400] hover:bg-[#e05a00] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                    {isActionLoading ? 'Saving...' : 'Save Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            {confirmDeleteId && (
                <div
                    className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
                    onClick={() => setConfirmDeleteId(null)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mx-auto">
                            <FiTrash2 />
                        </div>
                        <h3 className="text-base font-bold text-stone-900 font-poppins">
                            Delete Property Listing?
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            This will permanently remove the property and its associated data from the Hyve platform.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteProperty(confirmDeleteId)}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                            >
                                {isActionLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPropertyManagement;
