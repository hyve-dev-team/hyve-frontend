import Sidebar from './components/layout/Sidebar/Sidebar'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import ProfileOption from './components/layout/Profile/ProfileOption'

import { HiUser } from 'react-icons/hi'
import { GrTransaction } from 'react-icons/gr'

const LandlordProfile = () => {
    /* dummy data */
    const user = {
        name: "Jack William",
        email: "jackwilliam1704@gmail.com",
        profileImage: "/images/shared-images/user-1.png"
    };

    
    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar currentPage={"home"} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header />

                    <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                        <div className='w-full'>
                            {/* User profile information */}
                            <div className="flex flex-col items-center md:pt-4">
                                <div className='w-[70px] md:w-[100px] overflow-hidden rounded-full'>
                                    <img src={user.profileImage} alt="profile image" className='object-cover w-full h-full' />
                                </div>

                                <div className='mt-4 text-center'>
                                    <h3 className='text-[18px] font-semibold font-poppins'>{user.name}</h3>
                                    <p className='text-sm text-[#AAAAAA]'>{user.email}</p>
                                </div>
                            </div>

                            {/* user profile actions */}
                            <div className='flex flex-col gap-3 w-full sm:w-[80%] lg:w-[40%] mx-auto mt-8'>
                                <ProfileOption to="/landlord/verification" icon={GrTransaction} title={"Verification"} />
                                <ProfileOption to="/landlord/profile/update" icon={HiUser} title={"Edit Profile"} />
                                <ProfileOption to="/landlord/activity" icon={GrTransaction} title={"Activity"} />
                            </div>

                            {/* sign out action btn */}
                            <div className='mt-12 text-center'>
                                 <button className='px-3 py-1 text-sm text-white rounded-lg bg-primary hover:bg-primary-hover smooth-transition'>Sign out</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"home"} />
        </div>
    )
}

export default LandlordProfile