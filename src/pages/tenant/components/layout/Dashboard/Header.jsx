import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineNotificationsActive } from 'react-icons/md'
import userProfileImage from "../../../../../assets/images/shared-images/user-1.png"
import { PiHandWavingFill } from 'react-icons/pi'
import { RiSearch2Line } from 'react-icons/ri'

const Header = () => {
    const navigate = useNavigate();

    const [cachedUser, setCachedUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userData')) || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const syncUser = () => {
            try {
                const stored = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userData')) || null;
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
        : '';

    const avatar = cachedUser?.profilePictureUrl || userProfileImage;

    const handleNotification = () => {
        navigate("/user/notifications")
    }

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/user/apartment/search?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate(`/user/apartment/search`);
        }
    };

    return (
        <>
            <header className='sticky top-0 z-20 flex items-center justify-between px-3 pt-4 pb-3 bg-white border-b sm:flex-col sm:pt-5 sm:pb-4 sm:px-6 lg:px-8 lg:flex-row border-[#0000000D]'>
                {/* user profile image and greetings */}
                <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-[50%]'>
                    <div className='w-[40px] lg:w-[45px] h-[40px] lg:h-[45px] overflow-hidden rounded-full shadow-sm bg-primary/10 flex items-center justify-center shrink-0'>
                        <img
                            src={avatar}
                            alt="user-profile"
                            className='object-cover w-full h-full'
                            onError={(e) => { e.target.src = userProfileImage; }}
                        />
                    </div>

                    <div className=''>
                        <div className='flex items-center gap-1.5'>
                            <p className='font-normal text-sm lg:text-[16px]'>
                                {firstName ? `Hi, ${firstName}` : 'Hi'}
                            </p>
                            <PiHandWavingFill className='text-primary text-[22px]' />
                        </div>
                        <h4 className='text-sm font-medium capitalize lg:text-lg'>find your next space</h4>
                    </div>
                </div>

                {/* search input and notification icon */}
                <div className='hidden sm:flex items-center gap-6 w-full mt-4 lg:mt-0 lg:w-[50%] desktop-lg:w-[40%] '>
                    <div className='w-full'>
                        <form onSubmit={handleSearchSubmit} className='group flex flex-shrink items-center border border-[#AAAAAA] rounded-full overflow-hidden px-3 lg:px-5 shadow-sm focus-within:border-primary transition-colors bg-white'>
                            <span className='mr-2.5'><RiSearch2Line className='text-[#AAAAAA] text-[16px] lg:text-[20px] group-focus-within:text-primary transition-colors' /></span>

                            <input
                                type="search"
                                name='search-properties'
                                id='search-properties'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='outline-none w-full text-black py-2 lg:py-2.5 text-sm placeholder:font-light placeholder:text-[#AAAAAA]'
                                placeholder='Search area, type, 2 bedroom, studio...'
                            />
                        </form>
                    </div>

                    {/* Notification Icon: visible on larger screens */}
                    <button onClick={handleNotification}>
                        <MdOutlineNotificationsActive className='text-[22px] lg:text-[24px] cursor-pointer hover:text-primary smooth-transition text-black/70' />
                    </button>
                </div>

                {/* Notification Icon: visible on smaller screens */}
                <div className="sm:hidden">
                    <button onClick={handleNotification}>
                        <MdOutlineNotificationsActive className='text-[22px] lg:text-[24px] text-black/60' />
                    </button>
                </div>
            </header>
        </>
    )
}

export default Header