import React, { useState } from 'react'
import MobileNavigationItem from './MobileNavigationItem';

/* search */
import { RiSearch2Line } from 'react-icons/ri'
import { RiSearch2Fill } from "react-icons/ri";

/* saved */
import { BsHeart } from 'react-icons/bs';
import { BsHeartFill } from "react-icons/bs";

/* home */
import { RiHome9Line } from "react-icons/ri"
import { RiHome9Fill } from "react-icons/ri";;

/* chat */
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";

/* queue */
import { HiOutlineUsers } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi2";

/* user */
import { HiOutlineUser } from "react-icons/hi2";
import { HiUser } from "react-icons/hi2";




const MobileNavigationTab = ({ currentTab }) => {
    const [activeTab, setActiveTab] = useState(currentTab);

    const handleActiveTabChange = (currentTab) => {
        setActiveTab(currentTab);
    }

    return (
        <>
            <div className='bg-white fixed bottom-0 w-full z-[20] sm:hidden px-3 py-3'>
                <div className='flex items-end justify-between'>
                    <MobileNavigationItem to="/user/dashboard"
                        icon={activeTab === "home" ? RiHome9Fill : RiHome9Line} label="Home" onClick={() => handleActiveTabChange("home")} isActive={activeTab === "home"} />

                    <MobileNavigationItem to="/user/apartment/search"
                        icon={activeTab === "search" ? RiSearch2Fill : RiSearch2Line} label="Search" onClick={() => handleActiveTabChange("search")} isActive={activeTab === "search"} />

                    <MobileNavigationItem to="/user/apartment/saved"
                        icon={activeTab === "saved" ? BsHeartFill : BsHeart} label="Saved" className="text-[10px]" onClick={() => handleActiveTabChange("saved")} isActive={activeTab === "saved"} />
                   
                    <MobileNavigationItem to="/user/apartment/queue"
                        icon={activeTab === "queues" ? HiUsers : HiOutlineUsers} label="Queues" className="text-[10px]" onClick={() => handleActiveTabChange("queues")} isActive={activeTab === "queues"} />

                    
                    <MobileNavigationItem to="/user/chats"
                        icon={activeTab === "chats" ? HiMiniChatBubbleBottomCenterText : HiOutlineChatBubbleBottomCenterText} label="Chats" onClick={() => handleActiveTabChange("chats")} isActive={activeTab === "chats"} />

                    <MobileNavigationItem to="/user/profile"
                        icon={activeTab === "profile" ? HiUser : HiOutlineUser} label="Profile" onClick={() => handleActiveTabChange("profile")} isActive={activeTab === "profile"} />
                </div>
            </div>
        </>
    )
}

export default MobileNavigationTab