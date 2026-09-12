import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navitem from './Navitem';
import hyveLogo from "../../../../../assets/svg/logo/hyve-logo.svg"
import LogoutConfirmModal from '../../../../../components/common/LogoutConfirmModal';
import { performLogout } from '../../../../../utils/auth';

import { FaHouse } from "react-icons/fa6";
import { BsHeartFill } from "react-icons/bs";
import { HiUser, HiUsers } from "react-icons/hi2";
import { PiBuildingApartmentFill } from "react-icons/pi";
import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";
import { IoLogOutOutline } from "react-icons/io5";
import { RiSearch2Line } from "react-icons/ri";

const Sidebar = ({ currentPage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/user/apartment/search')) return 'search';
        if (path.startsWith('/user/apartment/manage')) return 'apartment';
        if (path.startsWith('/user/apartment/queue')) return 'queues';
        if (path.startsWith('/user/chats')) return 'chats';
        if (path.startsWith('/user/apartment/saved')) return 'saved';
        if (path.startsWith('/user/profile')) return 'profile';
        if (path === '/user/dashboard' || path === '/user') return 'home';
        return currentPage || 'home';
    };

    const activeNav = getActiveTab();

    const cachedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    })();

    const displayName = cachedUser?.firstName
        ? `${cachedUser.firstName} ${cachedUser.lastName || ''}`.trim()
        : cachedUser?.fullname || "Tenant";
    const userEmail = cachedUser?.email || "tenant@hyve.com";

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        performLogout(navigate);
    };

    return (
        <>
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />

            <aside className='bg-[#FFF0E6] hidden sm:flex flex-col justify-between flex-1 min-w-[210px] max-w-[270px] lg:max-w-[290px] h-[100svh] overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 py-6 border-r border-[#FF6300]/10 select-none'>
                {/* Top area: Logo & Nav items */}
                <div className='flex flex-col'>
                    {/* Logo & Portal Badge */}
                    <div className='flex items-center justify-between px-2 pt-1'>
                        <Link to="/user/dashboard" className='block w-[88px] lg:w-[96px]'>
                            <img src={hyveLogo} alt="Hyve-logo" className='object-contain w-full' />
                        </Link>
                        <span className='text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary font-poppins'>
                            Tenant
                        </span>
                    </div>

                    {/* Divider */}
                    <div className='h-[1px] bg-gradient-to-r from-transparent via-[#FF6300]/20 to-transparent my-6' />

                    {/* Menu */}
                    <div>
                        <p className='font-semibold text-[11px] px-3 text-[#3D3129]/50 tracking-wider uppercase'>
                            Menu
                        </p>

                        {/* Nav Items */}
                        <ul className='w-full mt-3 space-y-1.5'>
                            {/* home */}
                            <Navitem
                                icon={FaHouse}
                                to="/user/dashboard"
                                label="Home"
                                isActive={activeNav === "home"}
                            />

                            {/* search & filter */}
                            <Navitem
                                icon={RiSearch2Line}
                                to="/user/apartment/search"
                                label="Search & Filter"
                                isActive={activeNav === "search"}
                            />

                            {/* my apartment */}
                            <Navitem
                                icon={PiBuildingApartmentFill}
                                to="/user/apartment/manage"
                                label="My Apartment"
                                isActive={activeNav === "apartment"}
                            />

                            {/* Queue */}
                            <Navitem
                                icon={HiUsers}
                                to="/user/apartment/queue"
                                label="Queues"
                                isActive={activeNav === "queues"}
                            />

                            {/* chats */}
                            <Navitem
                                icon={HiMiniChatBubbleBottomCenterText}
                                to="/user/chats"
                                label="Chats"
                                isActive={activeNav === "chats"}
                            />

                            {/* saved apartments */}
                            <Navitem
                                icon={BsHeartFill}
                                to="/user/apartment/saved"
                                label="Saved"
                                isActive={activeNav === "saved"}
                            />

                            {/* profile */}
                            <Navitem
                                icon={HiUser}
                                to="/user/profile"
                                label="Profile"
                                isActive={activeNav === "profile"}
                            />
                        </ul>
                    </div>
                </div>

                {/* Bottom area: User snippet & Logout */}
                <div className='pt-4 mt-auto'>
                    <div className='h-[1px] bg-gradient-to-r from-transparent via-[#FF6300]/20 to-transparent mb-3' />

                    {/* Tenant mini profile card */}
                    <Link
                        to="/user/profile"
                        className='flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/70 transition-all duration-200 group mb-1.5'
                        title="View Profile"
                    >
                        <div className='w-9 h-9 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center text-primary font-semibold text-xs'>
                            {cachedUser?.profilePictureUrl ? (
                                <img src={cachedUser.profilePictureUrl} alt={displayName} className='w-full h-full object-cover' />
                            ) : (
                                displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className='min-w-0 flex-1'>
                            <p className='text-xs font-semibold text-[#3D3129] truncate group-hover:text-primary transition-colors'>
                                {displayName}
                            </p>
                            <p className='text-[11px] text-[#3D3129]/50 truncate'>
                                {userEmail}
                            </p>
                        </div>
                    </Link>

                    {/* Logout Button */}
                    <button
                        type='button'
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#3D3129]/75 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 group cursor-pointer'
                        title="Log out of your account"
                    >
                        <IoLogOutOutline className='text-[20px] text-[#3D3129]/60 group-hover:text-red-600 group-hover:-translate-x-0.5 transition-transform duration-200' />
                        <span className='text-xs font-medium'>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar