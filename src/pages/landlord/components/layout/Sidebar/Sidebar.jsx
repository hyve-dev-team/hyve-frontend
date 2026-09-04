import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navitem from './Navitem';
import hyveLogo from "../../../../../assets/svg/logo/hyve-logo.svg"

import { FaHouse } from "react-icons/fa6";
import { HiUser } from "react-icons/hi2";
import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";
import { IoMdAddCircle } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";

const Sidebar = ({ currentPage }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/landlord/property/add')) return 'add_property';
        if (path.startsWith('/landlord/chats')) return 'chats';
        if (path.startsWith('/landlord/profile')) return 'profile';
        if (path === '/landlord/dashboard' || path === '/landlord') return 'home';
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
        : "Landlord";
    const userEmail = cachedUser?.email || "landlord@hyve.com";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        navigate("/");
    };

    return (
        <aside className='bg-[#FFF0E6] hidden sm:flex flex-col justify-between flex-1 min-w-[210px] max-w-[270px] lg:max-w-[290px] h-[100svh] overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 py-6 border-r border-[#FF6300]/10 select-none'>
            {/* Top area: Logo & Nav items */}
            <div className='flex flex-col'>
                {/* Logo & Portal Badge */}
                <div className='flex items-center justify-between px-2 pt-1'>
                    <Link to="/landlord/dashboard" className='block w-[88px] lg:w-[96px]'>
                        <img src={hyveLogo} alt="Hyve-logo" className='object-contain w-full' />
                    </Link>
                    <span className='text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary font-poppins'>
                        Landlord
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
                            to="/landlord/dashboard"
                            label="Home"
                            isActive={activeNav === "home"}
                        />

                        {/* add property */}
                        <Navitem
                            icon={IoMdAddCircle}
                            to="/landlord/property/add"
                            label="Add Property"
                            isActive={activeNav === "add_property"}
                        />

                        {/* chats */}
                        <Navitem
                            icon={HiMiniChatBubbleBottomCenterText}
                            to="/landlord/chats"
                            label="Chats"
                            isActive={activeNav === "chats"}
                        />

                        {/* profile */}
                        <Navitem
                            icon={HiUser}
                            to="/landlord/profile"
                            label="Profile"
                            isActive={activeNav === "profile"}
                        />
                    </ul>
                </div>
            </div>

            {/* Bottom area: User snippet & Logout */}
            <div className='pt-4 mt-auto'>
                <div className='h-[1px] bg-gradient-to-r from-transparent via-[#FF6300]/20 to-transparent mb-3' />

                {/* Landlord mini profile card */}
                <Link
                    to="/landlord/profile"
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
    )
}

export default Sidebar