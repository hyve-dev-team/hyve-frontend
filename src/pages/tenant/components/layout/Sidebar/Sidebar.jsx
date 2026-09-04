// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
// import Navitem from './Navitem';
// import hyveLogo from "../../../../../assets/svg/logo/hyve-logo.svg"

// import { FaHouse } from "react-icons/fa6";
// import { BsHeartFill } from "react-icons/bs";
// import { HiUser, HiUsers } from "react-icons/hi2";
// import { PiBuildingApartmentFill } from "react-icons/pi";
// import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";

// const Sidebar = ({ currentPage }) => {
//     const [activeNav, setActiveNav] = useState(currentPage);

//     const handleActiveNavChange = (currentNav) => {
//         setActiveNav(currentNav)
//     }

//     return (
//         <>
//             <nav className='bg-[#FFF0E6] hidden sm:block flex-1 h-[100svh]  overflow-hidden px-4'>
//                 <div className='relative my-8'>

//                     {/* Logo */}
//                     <div className='w-[90px] sm:w-[90px] ml-4 lg:ml-6'>
//                         <Link to={"/user/dashboard"}>
//                             <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
//                         </Link>
//                     </div>

//                     {/* Menu */}
//                     <div className='mt-16'>
//                         <p className='font-normal text-[12px] lg:text-sm ml-4 lg:ml-6 text-[#3D3129]/80 tracking-widest'>MENU</p>

//                         {/* Nav Items */}
//                         <ul className='w-full mt-4'>
//                             {/* home */}
//                             <Navitem icon={FaHouse} to={"/user/dashboard"} label={"Home"} isActive={activeNav === "home"} onClick={() => handleActiveNavChange("home")} />

//                             {/* my apartment */}
//                             <Navitem icon={PiBuildingApartmentFill} to={"/user/apartment/manage"} label={"My Apartment"} isActive={activeNav === "apartment"} onClick={() => handleActiveNavChange("apartment")} />

//                             {/* Queue */}
//                             <Navitem icon={HiUsers} to={"/user/apartment/queue"} label={"Queues"} isActive={activeNav === "queues"} onClick={() => handleActiveNavChange("queues")} />

//                             {/* chats */}
//                             <Navitem icon={HiMiniChatBubbleBottomCenterText} to={"/user/chats"} label={"Chats"} isActive={activeNav === "chats"} onClick={() => handleActiveNavChange("chats")} className={"text-[16px]"} />

//                             {/* saved apartments */}
//                             <Navitem icon={BsHeartFill} to={"/user/apartment/saved"} label={"Saved"} isActive={activeNav === "saved"} onClick={() => handleActiveNavChange("saved")} className={"text-[16px]"} />

//                             {/* profile */}
//                             <Navitem icon={HiUser} to={"/user/profile"} label={"Profile"} isActive={activeNav === "profile"} onClick={() => handleActiveNavChange("profile")} />
//                         </ul>
//                     </div>
//                 </div>
//             </nav>
//         </>
//     )
// }

// export default Sidebar


import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navitem from './Navitem';
import hyveLogo from "../../../../../assets/svg/logo/hyve-logo.svg"

import { FaHouse } from "react-icons/fa6";
import { HiUser } from "react-icons/hi2";
import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";
import { IoMdAddCircle, IoMdLogOut } from "react-icons/io";

const Sidebar = ({currentPage}) => {
    const [activeNav, setActiveNav] = useState(currentPage);
    const navigate = useNavigate();

    const handleActiveNavChange = (currentNav) => {
        setActiveNav(currentNav)
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/auth/pre-login");
    }

    return (
        <>
            <nav className='bg-[#FFF0E6] hidden sm:flex sm:flex-col flex-1 h-[100svh] overflow-hidden px-4'>
                <div className='relative my-8'>

                    {/* Logo */}
                    <div className='w-[90px] sm:w-[90px] ml-4 lg:ml-6'>
                        <Link to={"/landlord/dashboard"}>
                            <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                        </Link>
                    </div>

                    <hr className='mt-[35px]' />


                    {/* Menu */}
                    <div className='mt-16'>
                        <p className='font-normal text-[12px] lg:text-sm ml-4 lg:ml-6 text-[#3D3129]/80 tracking-widest'>MENU</p>

                        {/* Nav Items */}
                        <ul className='w-full mt-4'>
                            {/* home */}
                            <Navitem icon={FaHouse} to={"/landlord/dashboard"} label={"Home"} isActive={activeNav === "home"} onClick={() => handleActiveNavChange("home")} />

                            {/* add property */}
                            <Navitem icon={IoMdAddCircle} to={"/landlord/property/add"} label={"Add Property"} isActive={activeNav === "add_property"} onClick={() => handleActiveNavChange("add_property")} />


                            {/* chats */}
                            <Navitem icon={HiMiniChatBubbleBottomCenterText} to={"/landlord/chats"} label={"Chats"} isActive={activeNav === "chats"} onClick={() => handleActiveNavChange("chats")} className={"text-[16px]"} />


                            {/* profile */}
                            <Navitem icon={HiUser} to={"/landlord/profile"} label={"Profile"} isActive={activeNav === "profile"} onClick={() => handleActiveNavChange("profile")} />
                        </ul>
                    </div>
                </div>

                {/* Logout, pinned to the bottom */}
                <div className='mt-auto mb-8'>
                    <button
                        onClick={handleLogout}
                        className='flex items-center w-full gap-3 py-2 pl-4 text-sm text-[#3D3129]/70 lg:pl-6 hover:text-primary smooth-transition'
                    >
                        <IoMdLogOut className='text-[18px]' />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Sidebar