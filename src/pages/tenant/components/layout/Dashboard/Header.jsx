import { useNavigate } from 'react-router-dom'
import { MdOutlineNotificationsActive } from 'react-icons/md'
import userProfileImage from "../../../../../assets/images/shared-images/user-1.png"
import { PiHandWavingFill } from 'react-icons/pi'
import { RiSearch2Line } from 'react-icons/ri'

const Header = () => {
    const navigate = useNavigate();
    // const userData = JSON.parse(localStorage.getItem('userData') || '{}')


    const handleNotification = () => {
        navigate("/user/notifications")
    }
    // alert(userData.email);
    return (
        <>
            <header className='sticky top-0 z-20 flex items-center justify-between px-3 pt-4 pb-3 bg-white border-b sm:flex-col sm:pt-5 sm:pb-4 sm:px-6 lg:px-8 lg:flex-row border-[#0000000D]'>
                {/* user profile image and greetings */}
                <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-[50%]'>
                    <div className='w-[40px] lg:w-[45px] overflow-hidden rounded-full shadow-sm'>
                        <img src={userProfileImage} alt="user-profile image" className='object-cover w-full' />
                    </div>

                    <div className=''>
                        <div className='flex items-center gap-1'>
                            {/* <p className='font-normal text-sm lg:text-[16px]'>Hi, {userData.firstName} {userData.lastName}</p> */}
                            <p className='font-normal text-sm lg:text-[16px]'>Hi,</p>
                            <PiHandWavingFill className='text-primary text-[22px]' />
                        </div>
                        <h4 className='text-sm font-medium capitalize lg:text-lg'>find your next space</h4>
                    </div>
                </div>

                {/* search input and notification icon */}
                <div className='hidden sm:flex items-center gap-6 w-full mt-4 lg:mt-0 lg:w-[50%] desktop-lg:w-[40%] '>
                    <div className='w-full'>
                        <div className='group flex flex-shrink items-center border border-[#AAAAAA] rounded-full overflow-hidden px-3 lg:px-5 shadow-sm'>
                            <span className='mr-3'><RiSearch2Line className='text-[#AAAAAA] text-[16px] lg:text-[20px]' /></span>

                            {/* This search input will use Debouncing: search result page:- /user/apartment/search */}
                            <input type="search" name='search-properties' id='search-properties' className='outline-none w-full text-black py-2 lg:py-3 text-sm placeholder:font-light placeholder:text-[#AAAAAA]' placeholder='I am looking for...' />
                        </div>
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