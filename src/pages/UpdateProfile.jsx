import Sidebar from './tenant/components/layout/Sidebar/Sidebar'
import Header from './tenant/components/layout/Dashboard/Header'
import MobileNavigationTab from './tenant/components/layout/MobileNavigation/MobileNavigationTab'
import { BsFillCameraFill } from "react-icons/bs";
const UpdateProfile = () => {
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
                <Sidebar currentPage={"profile"} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                    {/* dashboard header */}
                    <Header />

                    <div className='px-3 mt-8 pb-28 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                        <div className="flex flex-col items-center md:pt-4">
                            <div className='relative'>
                                <div className='w-[70px] md:w-[100px] overflow-hidden rounded-full '>
                                    <img src={user.profileImage} alt="profile image" className='object-cover w-full h-full' />
                                </div>
                                <span className='absolute bottom-0 right-0 flex items-center justify-center w-6 h-6 text-white rounded-full shadow-sm cursor-pointer md:w-8 md:h-8 bg-primary'>
                                    <BsFillCameraFill />
                                </span>
                            </div>
                        </div>

                        {/* user profile actions */}
                        <div className='flex flex-col gap-3 w-full sm:w-[80%] lg:w-[50%] mx-auto mt-14'>
                            <div>
                                <p className='text-sm'>Personal Information</p>
                                <form method='POST' className='flex flex-col gap-3 mt-2'>
                                    <div className=''>
                                        <label htmlFor="fullname" className='text-[#AAAAAA] text-sm'>Fullname</label>
                                        <input type="text" className='update_user_info' placeholder='Fullname' />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="email" className='text-[#AAAAAA] text-sm'>Email</label>
                                        <input type="text" value="Lorem@gmail.com" disabled className='update_user_info' placeholder='Your email address' />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="phone_number" className='text-[#AAAAAA] text-sm'>Phone number</label>
                                        <input type="text" className='update_user_info' placeholder='Phone number' />
                                    </div>

                                    <div className='flex justify-end mt-4'>
                                        <button type="submit" className='px-6 md:px-8 bg-primary hover:bg-primary-hover rounded-[8px] smooth-transition  py-3 shadow-md'>
                                            <p className='text-sm font-medium text-white font-athiti'>
                                                Save Changes
                                            </p>
                                        </button>
                                    </div>
                                </form>
                            </div>


                            <div className='mt-16'>
                                <p className='text-sm'>Change Password</p>
                                <form method='POST' className='flex flex-col gap-4 mt-2'>
                                    <div className=''>
                                        <label htmlFor="current_password" className='text-[#AAAAAA] text-sm'>Current Password</label>
                                        <input type="password" className='update_user_info' placeholder='Current password' />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="new_password" className='text-[#AAAAAA] text-sm'>New Password</label>
                                        <input type="password" className='update_user_info' placeholder='New password' />
                                    </div>
                                    <div className='flex justify-end mt-4'>
                                        <button type="submit" className='px-6 md:px-8 bg-primary hover:bg-primary-hover rounded-[8px] smooth-transition py-3 md:py-3 shadow-md'>
                                            <p className='text-sm font-medium text-white font-athiti'>
                                                Update password
                                            </p>
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"profile"} />
        </div>
    )
}

export default UpdateProfile