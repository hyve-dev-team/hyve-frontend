import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoChevronDown } from 'react-icons/io5';
import { HiOutlineBell } from 'react-icons/hi2';
import { FiLogOut, FiUser, FiExternalLink } from 'react-icons/fi';

const AdminHeader = ({ title, showWavingHand = true, onSearch, searchValue = "" }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userStr = localStorage.getItem("user");
    let adminUser = null;
    try {
        adminUser = userStr ? JSON.parse(userStr) : null;
    } catch {
        adminUser = null;
    }

    const adminName = adminUser?.firstName || "Admin";
    const initials = (
        (adminUser?.firstName ? adminUser.firstName[0] : '') +
        (adminUser?.lastName ? adminUser.lastName[0] : '')
    ).toUpperCase() || 'AD';
    const fullName = [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(' ') || "Administrator";
    const displayTitle = title || (adminUser?.firstName ? `Welcome, ${adminUser.firstName}` : "Welcome, Admin");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        navigate("/auth/signin");
    };

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-6 sm:px-10 bg-white border-b border-stone-100">
            {/* Title / Greeting */}
            <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-poppins">
                    {displayTitle}
                </h1>
                {showWavingHand && <span className="text-xl sm:text-2xl select-none">👋</span>}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
                {/* Search Bar */}
                <div className="relative">
                    <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200/80 rounded-full w-36 sm:w-56 focus:w-48 sm:focus:w-72 transition-all outline-none focus:border-stone-300 focus:bg-white"
                    />
                </div>

                {/* Notifications Bell */}
                <button
                    type="button"
                    className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-colors"
                    title="Notifications"
                >
                    <HiOutlineBell className="text-xl" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FA6400] rounded-full ring-2 ring-white"></span>
                </button>

                {/* User Profile & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-stone-50 transition-colors"
                    >
                        <div className="relative">
                            {adminUser?.profilePicture ? (
                                <img
                                    src={adminUser.profilePicture}
                                    alt={fullName}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-stone-100"
                                />
                            ) : (
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF2EA] text-[#FA6400] font-bold text-xs flex items-center justify-center ring-2 ring-stone-100">
                                    {initials}
                                </div>
                            )}
                            {/* Online green indicator */}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-stone-800 hidden md:inline">
                            My Account
                        </span>
                        <IoChevronDown className="text-stone-500 text-xs" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-4 py-2.5 border-b border-stone-100">
                                <p className="text-sm font-semibold text-stone-900">{fullName}</p>
                                <p className="text-xs text-stone-400 truncate">{adminUser?.email || "No email"}</p>
                                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-[#FA6400] border border-orange-200/60">
                                    System Administrator
                                </span>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => navigate('/landlord/dashboard')}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-[#FA6400] transition-colors text-left"
                                >
                                    <FiExternalLink className="text-sm" />
                                    <span>Switch to Landlord Portal</span>
                                </button>
                                <button
                                    onClick={() => navigate('/user/dashboard')}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-[#FA6400] transition-colors text-left"
                                >
                                    <FiUser className="text-sm" />
                                    <span>Switch to Tenant Portal</span>
                                </button>
                            </div>

                            <div className="border-t border-stone-100 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                >
                                    <FiLogOut className="text-sm" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
