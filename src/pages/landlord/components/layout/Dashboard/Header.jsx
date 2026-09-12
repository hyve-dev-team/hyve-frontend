import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineNotificationsActive } from 'react-icons/md'
import userProfileImage from "../../../../../assets/images/shared-images/user-1.png"
import { PiHandWavingFill } from 'react-icons/pi'

const Header = () => {
    const navigate = useNavigate();

    const handleNotification = () => {
        navigate("/landlord/notifications")
    }

    const [cachedUser, setCachedUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("userData")) || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const syncUser = () => {
            try {
                const stored = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("userData")) || null;
                setCachedUser(stored);
            } catch {
                // Ignore parse errors
            }
        };

        window.addEventListener('storage', syncUser);
        window.addEventListener('focus', syncUser);
        return () => {
            window.removeEventListener('storage', syncUser);
            window.removeEventListener('focus', syncUser);
        };
    }, []);

    const rawFirstName = 
        cachedUser?.firstName || 
        cachedUser?.firstname || 
        (cachedUser?.fullName ? cachedUser.fullName.trim().split(' ')[0] : '') ||
        (cachedUser?.name ? cachedUser.name.trim().split(' ')[0] : '') ||
        (cachedUser?.email ? cachedUser.email.split('@')[0] : '');

    const firstName = rawFirstName 
        ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)
        : 'Landlord';

    const avatar = cachedUser?.profilePictureUrl || userProfileImage;

    return (
        <header className='sticky top-0 z-20 flex items-center justify-between px-3 pt-4 pb-3 bg-white border-b sm:pt-5 sm:pb-4 sm:px-6 lg:px-8 lg:flex-row border-[#0000000D]'>
            {/* user profile image and greetings */}
            <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-[50%]'>
                <div className='w-[40px] lg:w-[45px] h-[40px] lg:h-[45px] overflow-hidden rounded-full shadow-sm bg-primary/10 flex items-center justify-center flex-shrink-0'>
                    <img
                        src={avatar}
                        alt="user-profile"
                        className='object-cover w-full h-full'
                        onError={(e) => { e.target.src = userProfileImage; }}
                    />
                </div>

                <div>
                    <div className='flex items-center gap-1'>
                        <p className='font-normal text-sm lg:text-[16px]'>Hi, {firstName}</p>
                        <PiHandWavingFill className='text-primary text-[22px]' />
                    </div>
                    <h4 className='text-sm font-medium capitalize lg:text-lg'>Manage your Properties</h4>
                </div>
            </div>

            {/* Notification Icon */}
            <button onClick={handleNotification} title="Notifications">
                <MdOutlineNotificationsActive className='text-[22px] lg:text-[24px] cursor-pointer hover:text-primary smooth-transition text-black/70' />
            </button>
        </header>
    )
}

export default Header