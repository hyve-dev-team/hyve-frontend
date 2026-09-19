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
    FiLayers
} from 'react-icons/fi';
import { RiBuilding4Line, RiShieldCheckFill } from 'react-icons/ri';
import { IoCloseOutline } from 'react-icons/io5';

const AdminPropertyManagement = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all'); // all, ACTIVE, INACTIVE, RENTED
    const [typeFilter, setTypeFilter] = useState('all'); // all, APARTMENT, ROOM, HOUSE
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for viewing property details
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, [statusFilter, typeFilter, searchQuery]);

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
                if (res?.message) {
                    setError(res.message);
                }
            }
        } catch (err) {
            console.error('Failed to load properties:', err);
            setError(err?.message || 'Unable to load property listings from server.');
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setIsActionLoading(true);
        try {
            const res = await config.putAPI({
                url: `/api/v1/admin/properties/${id}/status`,
                params: { status: newStatus }
            });

            if (res?.success) {
                hyveSuccess('Status Updated', `Property status set to ${newStatus}`);
                if (selectedProperty && selectedProperty.id === id) {
                    setSelectedProperty((prev) => ({ ...prev, status: newStatus }));
                }
                fetchProperties();
            } else {
                hyveError('Update Failed', res?.message || 'Could not update property status');
            }
        } catch (err) {
            console.error('Update status failed:', err);
            hyveError('Error', err?.message || 'An error occurred updating property status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteProperty = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await config.deleteAPI({
                url: `/api/v1/admin/properties/${id}`
            });

            if (res?.success) {
                hyveSuccess('Property Deleted', 'Listing removed from the platform.');
                setConfirmDeleteId(null);
                if (selectedProperty?.id === id) {
                    setSelectedProperty(null);
                }
                fetchProperties();
            } else {
                hyveError('Deletion Failed', res?.message || 'Could not delete property');
            }
        } catch (err) {
            console.error('Delete property failed:', err);
            hyveError('Error', err?.message || 'An error occurred deleting property');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Overall summary metrics
    const totalCount = properties.length;
    const activeCount = properties.filter((p) => p.status === 'ACTIVE').length;
    const rentedCount = properties.filter((p) => p.status === 'RENTED').length;
    const inactiveCount = properties.filter((p) => p.status === 'INACTIVE').length;

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
                        <span className="text-xs font-semibold text-stone-500">Active Listings</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#12B76A] font-poppins">
                                {isLoading ? '-' : activeCount}
                            </span>
                            <span className="text-xs text-emerald-600 bg-[#E6F8EF] px-2 py-0.5 rounded-full font-bold">
                                Live
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Rented Properties</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#7F56D9] font-poppins">
                                {isLoading ? '-' : rentedCount}
                            </span>
                            <span className="text-xs text-purple-600 bg-[#F4EBFF] px-2 py-0.5 rounded-full font-bold">
                                Occupied
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <span className="text-xs font-semibold text-stone-500">Inactive / Suspended</span>
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#F04438] font-poppins">
                                {isLoading ? '-' : inactiveCount}
                            </span>
                            <span className="text-xs text-red-600 bg-[#FEECEB] px-2 py-0.5 rounded-full font-bold">
                                Hidden
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Main Card with Search, Filter Tabs, and Property Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                    {/* Header bar with filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                        <div>
                            <h2 className="text-lg font-bold text-stone-900 font-poppins">All Housing Units</h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Review, inspect, moderate, or deactivate property listings across campus locations.
                            </p>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status filters */}
                            <div className="flex p-1 bg-stone-100 rounded-full text-xs font-semibold">
                                {[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Active', value: 'ACTIVE' },
                                    { label: 'Rented', value: 'RENTED' },
                                    { label: 'Inactive', value: 'INACTIVE' }
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

                            {/* Property type filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-700 rounded-full border-none outline-none cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="APARTMENT">Apartment</option>
                                <option value="ROOM">Room</option>
                                <option value="HOUSE">House</option>
                            </select>
                        </div>
                    </div>

                    {/* Properties Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 pl-2">Property</th>
                                    <th className="pb-3">Location</th>
                                    <th className="pb-3">Landlord / Contact</th>
                                    <th className="pb-3">Price</th>
                                    <th className="pb-3">Activity</th>
                                    <th className="pb-3">Status</th>
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
                                ) : properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-stone-400 text-xs sm:text-sm">
                                            No properties match your current search or filter.
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map((p) => {
                                        const thumb = p.images && p.images.length > 0 ? p.images[0] : '';
                                        const monthlyPrice = p.priceMonthly ? `₦ ${Number(p.priceMonthly).toLocaleString()}/mo` : null;
                                        const annualPrice = p.priceAnnually ? `₦ ${Number(p.priceAnnually).toLocaleString()}/yr` : null;

                                        return (
                                            <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                                                {/* Thumbnail & Title */}
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
                                                        <div className="max-w-[220px]">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FA6400]">
                                                                {p.idNo}
                                                            </span>
                                                            <p className="text-xs font-bold text-stone-900 truncate" title={p.title}>
                                                                {p.title}
                                                            </p>
                                                            <span className="text-[11px] text-stone-400">
                                                                {p.propertyType || 'Apartment'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Location */}
                                                <td className="py-4 text-xs text-stone-600">
                                                    <div className="flex items-center gap-1.5 max-w-[160px] truncate">
                                                        <FiMapPin className="text-stone-400 shrink-0" />
                                                        <span className="truncate">{p.location || 'Not specified'}</span>
                                                    </div>
                                                </td>

                                                {/* Landlord */}
                                                <td className="py-4 text-xs text-stone-700">
                                                    <div className="font-semibold text-stone-900">{p.landlordName || 'Verified Host'}</div>
                                                    <div className="text-[11px] text-stone-400">{p.landlordEmail || '-'}</div>
                                                </td>

                                                {/* Price */}
                                                <td className="py-4 text-xs">
                                                    <div className="font-bold text-stone-900">
                                                        {monthlyPrice || annualPrice || '₦ 0'}
                                                    </div>
                                                    {monthlyPrice && annualPrice && (
                                                        <div className="text-[10px] text-stone-400">{annualPrice}</div>
                                                    )}
                                                </td>

                                                {/* Activity (Queues & Inspections) */}
                                                <td className="py-4 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold" title="Queued Tenants">
                                                            {p.activeQueuesCount} in queue
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold" title="Tour Inspections">
                                                            {p.pendingInspectionsCount} tours
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4">
                                                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                                        p.status === 'ACTIVE'
                                                            ? 'bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/40'
                                                            : p.status === 'RENTED'
                                                            ? 'bg-[#F4EBFF] text-[#7F56D9] border border-purple-200/40'
                                                            : 'bg-[#FEECEB] text-[#F04438] border border-red-200/40'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 text-right pr-2">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* View Details */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProperty(p)}
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                                                            title="Inspect Property Details"
                                                        >
                                                            <FiEye className="text-xs" />
                                                        </button>

                                                        {/* Toggle status */}
                                                        {p.status === 'ACTIVE' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(p.id, 'INACTIVE')}
                                                                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                                                title="Deactivate Listing"
                                                            >
                                                                <FiXCircle className="text-xs" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(p.id, 'ACTIVE')}
                                                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                                                                title="Activate Listing"
                                                            >
                                                                <FiCheckCircle className="text-xs" />
                                                            </button>
                                                        )}

                                                        {/* Public View link */}
                                                        <a
                                                            href={`/user/apartment/${p.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                                            title="Open Public Page"
                                                        >
                                                            <FiExternalLink className="text-xs" />
                                                        </a>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteId(p.id)}
                                                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                                            title="Delete Listing"
                                                        >
                                                            <FiTrash2 className="text-xs" />
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
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#FA6400]">
                                        {selectedProperty.idNo}
                                    </span>
                                    <h3 className="text-lg font-bold text-stone-900 font-poppins">
                                        {selectedProperty.title}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProperty(null)}
                                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                                >
                                    <IoCloseOutline className="text-2xl" />
                                </button>
                            </div>

                            {/* Images Gallery */}
                            {selectedProperty.images && selectedProperty.images.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                        Property Photos
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedProperty.images.slice(0, 3).map((img, idx) => (
                                            <a
                                                key={idx}
                                                href={img}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200 block group"
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Photo ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    <span className="text-stone-400 block text-[11px]">Listing Date</span>
                                    <span className="font-bold text-stone-900">{formatDate(selectedProperty.createdAt)}</span>
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

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                                    Description
                                </h4>
                                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                                    {selectedProperty.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Amenities */}
                            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                        Amenities
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedProperty.amenities.map((a, i) => (
                                            <span key={i} className="text-[11px] font-medium px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Landlord Contact Info */}
                            <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl space-y-2 text-xs">
                                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                    <FiUser className="text-[#FA6400]" />
                                    <span>Landlord Information</span>
                                </h4>
                                <div className="space-y-1 text-stone-700 text-xs">
                                    <p><strong>Name:</strong> {selectedProperty.landlordName || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedProperty.landlordEmail || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedProperty.landlordPhone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                            {selectedProperty.status !== 'ACTIVE' ? (
                                <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(selectedProperty.id, 'ACTIVE')}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-[#12B76A] hover:bg-[#0ea35c] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle />
                                    <span>Activate Listing</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(selectedProperty.id, 'INACTIVE')}
                                    disabled={isActionLoading}
                                    className="flex-1 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiXCircle />
                                    <span>Deactivate Listing</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleUpdateStatus(selectedProperty.id, 'RENTED')}
                                disabled={isActionLoading}
                                className="px-4 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Mark Rented
                            </button>
                        </div>
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
                            This will permanently remove the property and its associated photos from the Hyve Haven catalog.
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
