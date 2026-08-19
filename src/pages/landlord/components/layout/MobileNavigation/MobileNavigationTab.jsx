import React, { useState } from 'react'
import MobileNavigationItem from './MobileNavigationItem';


/* home */
import { RiHome9Line } from "react-icons/ri"
import { RiHome9Fill } from "react-icons/ri";

/* add property */
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { IoIosAddCircleOutline } from "react-icons/io";

/* chat */
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { HiMiniChatBubbleBottomCenterText } from "react-icons/hi2";

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
                    <MobileNavigationItem to="/landlord/property/add"
                        icon={activeTab === "add_property" ? IoIosAddCircle : IoIosAddCircleOutline} label="Add" onClick={() => handleActiveTabChange("add_property")} isActive={activeTab === "add_property"} />

                    <MobileNavigationItem to="/landlord/dashboard"
                        icon={activeTab === "home" ? RiHome9Fill : RiHome9Line} label="Home" onClick={() => handleActiveTabChange("home")} isActive={activeTab === "home"} />

                    <MobileNavigationItem to="/landlord/chats"
                        icon={activeTab === "chats" ? HiMiniChatBubbleBottomCenterText : HiOutlineChatBubbleBottomCenterText} label="Chats" onClick={() => handleActiveTabChange("chats")} isActive={activeTab === "chats"} />

                    <MobileNavigationItem to="/landlord/profile"
                        icon={activeTab === "profile" ? HiUser : HiOutlineUser} label="Profile" onClick={() => handleActiveTabChange("profile")} isActive={activeTab === "profile"} />
                </div>
            </div>
        </>
    )
}

export default MobileNavigationTab