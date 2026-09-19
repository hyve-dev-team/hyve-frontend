import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import config from '../../config';

import { HiUsers, HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { FiTrendingDown, FiTrendingUp, FiArrowUpRight, FiInfo, FiRefreshCw } from 'react-icons/fi';
import { RiBuilding4Line } from 'react-icons/ri';
import { BsPersonBadgeFill } from 'react-icons/bs';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');
    const [activeRevenueTab, setActiveRevenueTab] = useState('total');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await config.getAPI({
                url: '/api/v1/admin/dashboard-stats'
            });
            if (res?.success && res?.data) {
                setStats(res.data);
            } else {
                setError(res?.message || 'Unable to retrieve dashboard metrics from server.');
                setStats(null);
            }
        } catch (err) {
            console.error('Failed to load admin stats:', err);
            setError(err?.message || 'Unable to connect to the backend server. Please verify your connection.');
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Revenue chart calculation for smooth SVG path
    const chartPoints = stats?.revenueChart || [];
    const hasChartData = chartPoints.some((p) => p.value > 0);

    const chartWidth = 560;
    const chartHeight = 220;
    const paddingX = 40;
    const paddingY = 20;

    // Find max value in points or fallback to 10 for scaling
    const maxVal = Math.max(...chartPoints.map((p) => p.value || 0), 10);

    const pointsCoordinates = chartPoints.map((pt, idx) => {
        const x = chartPoints.length > 1
            ? paddingX + (idx * ((chartWidth - paddingX * 2) / (chartPoints.length - 1)))
            : chartWidth / 2;
        const y = chartHeight - paddingY - ((pt.value || 0) / maxVal) * (chartHeight - paddingY * 2);
        return { x, y, day: pt.day, value: pt.value || 0 };
    });

    const pathD = pointsCoordinates.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return `M ${curr.x} ${curr.y}`;
        const prev = arr[idx - 1];
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        const cp2y = curr.y;
        return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }, '');

    // Format financial display
    const formatCurrency = (val) => {
        if (val == null || val === 0) return '₦ 0';
        if (val >= 1000000) return `₦ ${(val / 1000000).toFixed(2)}m`;
        if (val >= 1000) return `₦ ${(val / 1000).toFixed(1)}k`;
        return `₦ ${Number(val).toLocaleString()}`;
    };

    return (
        <AdminLayout>
            <AdminHeader
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
                            onClick={fetchDashboardStats}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
                        >
                            <FiRefreshCw className="text-xs" />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* 1. Metric Stat Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Total Student Users */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#FFF2EA] text-[#FA6400] flex items-center justify-center text-xl shadow-xs">
                                    <HiUsers />
                                </div>
                                <h2 className="text-sm font-semibold text-stone-800">Total Student Users</h2>
                            </div>
                            <button className="text-stone-300 hover:text-stone-600 transition-colors">
                                <HiOutlineEllipsisVertical className="text-lg" />
                            </button>
                        </div>

                        <div className="mt-6 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : (stats?.totalStudents ?? 0)}
                            </span>
                            {stats?.studentsChangePercent !== 0 && stats?.studentsChangePercent != null && (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    stats.studentsChangePercent >= 0
                                        ? 'bg-[#E6F8EF] text-[#12B76A]'
                                        : 'bg-[#FEECEB] text-[#F04438]'
                                }`}>
                                    {stats.studentsChangePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                    <span>{stats.studentsChangePercent > 0 ? `+${stats.studentsChangePercent}%` : `${stats.studentsChangePercent}%`}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Total Landlord Users */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#F4EBFF] text-[#7F56D9] flex items-center justify-center text-xl shadow-xs">
                                    <RiBuilding4Line />
                                </div>
                                <h2 className="text-sm font-semibold text-stone-800">Total Landlord Users</h2>
                            </div>
                            <button className="text-stone-300 hover:text-stone-600 transition-colors">
                                <HiOutlineEllipsisVertical className="text-lg" />
                            </button>
                        </div>

                        <div className="mt-6 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : (stats?.totalLandlords ?? 0)}
                            </span>
                            {stats?.landlordsChangePercent !== 0 && stats?.landlordsChangePercent != null && (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    stats.landlordsChangePercent >= 0
                                        ? 'bg-[#E6F8EF] text-[#12B76A]'
                                        : 'bg-[#FEECEB] text-[#F04438]'
                                }`}>
                                    {stats.landlordsChangePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                    <span>{stats.landlordsChangePercent > 0 ? `+${stats.landlordsChangePercent}%` : `${stats.landlordsChangePercent}%`}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Total Agent Users */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#ECFDF3] text-[#027A48] flex items-center justify-center text-xl shadow-xs">
                                    <BsPersonBadgeFill />
                                </div>
                                <h2 className="text-sm font-semibold text-stone-800">Total Agent Users</h2>
                            </div>
                            <button className="text-stone-300 hover:text-stone-600 transition-colors">
                                <HiOutlineEllipsisVertical className="text-lg" />
                            </button>
                        </div>

                        <div className="mt-6 flex items-baseline justify-between">
                            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-poppins">
                                {isLoading ? '-' : (stats?.totalAgents ?? 0)}
                            </span>
                            {stats?.agentsChangePercent !== 0 && stats?.agentsChangePercent != null && (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    stats.agentsChangePercent >= 0
                                        ? 'bg-[#E6F8EF] text-[#12B76A]'
                                        : 'bg-[#FEECEB] text-[#F04438]'
                                }`}>
                                    {stats.agentsChangePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                    <span>{stats.agentsChangePercent > 0 ? `+${stats.agentsChangePercent}%` : `${stats.agentsChangePercent}%`}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Middle Row: Revenue Overview & Customer Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Revenue Overview (approx 65%) */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-poppins">
                                Revenue Overview
                            </h2>
                            <div className="flex items-center gap-3">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-stone-300"
                                >
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                    <option value="90d">Last 90 Days</option>
                                </select>
                                <button className="text-stone-300 hover:text-stone-600">
                                    <HiOutlineEllipsisVertical className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Revenue Sub-metrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-stone-100 text-left">
                            <button
                                type="button"
                                onClick={() => setActiveRevenueTab('total')}
                                className="text-left relative pb-2 group cursor-pointer"
                            >
                                <p className="text-lg sm:text-xl font-bold text-stone-900 font-poppins">
                                    {formatCurrency(stats?.totalRevenue)}
                                </p>
                                <p className="text-xs text-stone-400 font-medium mt-0.5">Total Revenue</p>
                                {activeRevenueTab === 'total' && (
                                    <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FA6400] rounded-full"></div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveRevenueTab('escrow')}
                                className="text-left relative pb-2 group cursor-pointer"
                            >
                                <p className="text-lg sm:text-xl font-bold text-stone-900 font-poppins">
                                    {formatCurrency(stats?.pendingEscrow)}
                                </p>
                                <p className="text-xs text-stone-400 font-medium mt-0.5">Pending in Escrow</p>
                                {activeRevenueTab === 'escrow' && (
                                    <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FA6400] rounded-full"></div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveRevenueTab('released')}
                                className="text-left relative pb-2 group cursor-pointer"
                            >
                                <p className="text-lg sm:text-xl font-bold text-stone-900 font-poppins">
                                    {formatCurrency(stats?.releasedPayments)}
                                </p>
                                <p className="text-xs text-stone-400 font-medium mt-0.5">Released Payments</p>
                                {activeRevenueTab === 'released' && (
                                    <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FA6400] rounded-full"></div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveRevenueTab('refunds')}
                                className="text-left relative pb-2 group cursor-pointer"
                            >
                                <p className="text-lg sm:text-xl font-bold text-stone-900 font-poppins">
                                    {formatCurrency(stats?.refunds)}
                                </p>
                                <p className="text-xs text-stone-400 font-medium mt-0.5">Refunds</p>
                                {activeRevenueTab === 'refunds' && (
                                    <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-[#FA6400] rounded-full"></div>
                                )}
                            </button>
                        </div>

                        {/* Line Chart Visual or Empty State */}
                        <div className="pt-6 relative">
                            {chartPoints.length === 0 || !hasChartData ? (
                                <div className="py-16 text-center text-stone-400 text-xs sm:text-sm flex flex-col items-center justify-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-lg">
                                        <FiInfo />
                                    </div>
                                    <p className="font-semibold text-stone-600">No Revenue Transactions Recorded</p>
                                    <p className="text-stone-400 text-xs max-w-sm">
                                        Lease payments and escrow deposits processed through the platform will appear here on this timeline.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Y-axis labels & grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[11px] text-stone-300 font-medium">
                                        <div className="border-b border-stone-100/70 w-full flex justify-between"><span>{formatCurrency(maxVal)}</span></div>
                                        <div className="border-b border-stone-100/70 w-full flex justify-between"><span>{formatCurrency(maxVal * 0.75)}</span></div>
                                        <div className="border-b border-stone-100/70 w-full flex justify-between"><span>{formatCurrency(maxVal * 0.5)}</span></div>
                                        <div className="border-b border-stone-100/70 w-full flex justify-between"><span>{formatCurrency(maxVal * 0.25)}</span></div>
                                        <div className="border-b border-stone-100/70 w-full flex justify-between"><span>₦ 0</span></div>
                                    </div>

                                    <svg
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                        className="w-full h-44 sm:h-52 overflow-visible relative z-10"
                                    >
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#FA6400" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#FA6400" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        <path
                                            d={`${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${chartHeight - paddingY} L ${pointsCoordinates[0].x} ${chartHeight - paddingY} Z`}
                                            fill="url(#revenueGrad)"
                                        />

                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke="#FA6400"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {pointsCoordinates.map((pt, i) => (
                                            <g key={i} className="group/node cursor-pointer">
                                                <circle
                                                    cx={pt.x}
                                                    cy={pt.y}
                                                    r="4"
                                                    className="fill-white stroke-[#FA6400] stroke-[3] group-hover/node:r-6 transition-all"
                                                />
                                                <title>{`${pt.day}: ${formatCurrency(pt.value)}`}</title>
                                            </g>
                                        ))}
                                    </svg>

                                    {/* X-axis days */}
                                    <div className="flex justify-between px-10 text-xs font-medium text-stone-400 mt-2">
                                        {chartPoints.map((p) => (
                                            <span key={p.day}>{p.day}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Customer Activity (approx 35%) */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                                <h2 className="text-base sm:text-lg font-bold text-stone-900 font-poppins">
                                    Customer Activity
                                </h2>
                                <button className="text-stone-300 hover:text-stone-600">
                                    <HiOutlineEllipsisVertical className="text-lg" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Student Progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                                        <span>Student</span>
                                        <span className="text-stone-500 font-normal">{stats?.customerActivity?.studentActivePercent || 0}% active</span>
                                    </div>
                                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#FA6400] rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.max(stats?.customerActivity?.studentActivePercent || 0, 0)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium mt-1">
                                        <span className="text-[#FA6400]">Active</span>
                                        <span className="text-stone-400">Inactive</span>
                                    </div>
                                </div>

                                {/* Landlords Progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                                        <span>Landlords</span>
                                        <span className="text-stone-500 font-normal">{stats?.customerActivity?.landlordActivePercent || 0}% active</span>
                                    </div>
                                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#A855F7] rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.max(stats?.customerActivity?.landlordActivePercent || 0, 0)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium mt-1">
                                        <span className="text-[#A855F7]">Active</span>
                                        <span className="text-stone-400">Inactive</span>
                                    </div>
                                </div>

                                {/* Agents Progress */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                                        <span>Agents</span>
                                        <span className="text-stone-500 font-normal">{stats?.customerActivity?.agentActivePercent || 0}% active</span>
                                    </div>
                                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#22C55E] rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.max(stats?.customerActivity?.agentActivePercent || 0, 0)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium mt-1">
                                        <span className="text-[#22C55E]">Active</span>
                                        <span className="text-stone-400">Inactive</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-stone-400 leading-relaxed mt-6 pt-4 border-t border-stone-100">
                            Monitor live user activity levels across the platform. Real active sessions vs inactive accounts.
                        </p>
                    </div>
                </div>

                {/* 3. Bottom Card: Property Listings Preview Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                        <h2 className="text-base sm:text-lg font-bold text-stone-900 font-poppins">
                            Property Listings
                        </h2>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/properties')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-[#FA6400] transition-colors cursor-pointer"
                        >
                            <span>Show All</span>
                            <FiArrowUpRight className="text-sm" />
                        </button>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-medium text-stone-400 border-b border-stone-100 pb-3">
                                    <th className="pb-3 font-semibold">Product</th>
                                    <th className="pb-3 font-semibold">Price</th>
                                    <th className="pb-3 font-semibold">Date listed</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {(!stats?.recentListings || stats.recentListings.length === 0) ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-stone-400 font-medium text-xs sm:text-sm">
                                            No property listings have been added to the system yet.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recentListings.slice(0, 5).map((listing) => (
                                        <tr key={listing.id} className="hover:bg-stone-50/60 transition-colors">
                                            {/* Product thumbnail and title */}
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/50 flex items-center justify-center text-stone-300">
                                                        {listing.image ? (
                                                            <img
                                                                src={listing.image}
                                                                alt={listing.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <RiBuilding4Line className="text-xl" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-medium text-stone-400">
                                                            {listing.idNo || String(listing.id).padStart(6, '0')}
                                                        </p>
                                                        <p className="text-sm font-semibold text-stone-800 line-clamp-1">
                                                            {listing.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 text-sm font-semibold text-stone-800">
                                                {listing.price ? `₦ ${Number(listing.price).toLocaleString()}` : 'Price not set'}
                                            </td>

                                            {/* Date listed */}
                                            <td className="py-4 text-xs text-stone-500 font-medium">
                                                {listing.dateListed || '-'}
                                            </td>

                                            {/* Status */}
                                            <td className="py-4">
                                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                                    listing.status === 'Verified'
                                                        ? 'bg-[#E6F8EF] text-[#12B76A] border border-emerald-200/40'
                                                        : 'bg-[#FEF6EE] text-[#F79009] border border-amber-200/40'
                                                }`}>
                                                    {listing.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </AdminLayout>
    );
};

export default AdminDashboard;
