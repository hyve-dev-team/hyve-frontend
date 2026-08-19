import { useNavigate } from 'react-router-dom'
import { MdOutlineNotificationsActive } from 'react-icons/md'
import userProfileImage from "../../../../../assets/images/shared-images/user-1.png"
import { PiHandWavingFill } from 'react-icons/pi'
import { RiSearch2Line } from 'react-icons/ri'

const Header = () => {
    const navigate = useNavigate();

    const handleNotification = () => {
        navigate("/landlord/notifications")
    }

    return (
        <>
            <header className='sticky top-0 z-20 flex items-center justify-between px-3 pt-4 pb-3 bg-white border-b  sm:pt-5 sm:pb-4 sm:px-6 lg:px-8 lg:flex-row border-[#0000000D]'>
                {/* user profile image and greetings */}
                <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-[50%]'>
                    <div className='w-[40px] lg:w-[45px] overflow-hidden rounded-full shadow-sm'>
                        <img src={userProfileImage} alt="user-profile image" className='object-cover w-full' />
                    </div>

                    <div className=''>
                        <div className='flex items-center gap-1'>
                            <p className='font-normal text-sm lg:text-[16px]'>Hi, Oluwatimileyin</p>
                            <PiHandWavingFill className='text-primary text-[22px]' />
                        </div>
                        <h4 className='text-sm font-medium capitalize lg:text-lg'>Manage your Properties</h4>
                    </div>
                </div>


                {/* Notification Icon */}
                <button onClick={handleNotification}>
                    <MdOutlineNotificationsActive className='text-[22px] lg:text-[24px] cursor-pointer hover:text-primary smooth-transition text-black/70' />
                </button>
            </header>
        </>
    )
}

export default Header