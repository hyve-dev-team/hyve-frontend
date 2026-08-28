
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './tenant/components/layout/Sidebar/Sidebar'
import Header from './tenant/components/layout/Dashboard/Header'
import MobileNavigationTab from './tenant/components/layout/MobileNavigation/MobileNavigationTab'
import { BsFillCameraFill } from "react-icons/bs";
import config from '../config';
import { hyveSuccess, hyveError } from '../utils/hyveToast';
import defaultProfileImage from "../assets/images/shared-images/user-1.png";

const UpdateProfile = () => {
    const navigate = useNavigate();

    const cachedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    })();

    const [firstName, setFirstName] = useState(cachedUser?.firstName || "");
    const [lastName, setLastName] = useState(cachedUser?.lastName || "");
    const [phone, setPhone] = useState(cachedUser?.phone || "");
    const [isSaving, setIsSaving] = useState(false);

    const profileImage = cachedUser?.profilePictureUrl || defaultProfileImage;
    const email = cachedUser?.email || "";

    // Real backend: PUT /api/v1/user/profile — returns the updated User, which we
    // cache back into localStorage so Profile.jsx (which has no fetch-on-load,
    // there's no GET /profile endpoint) reflects the change immediately.
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await config.allAPI({
                url: "/api/v1/user/profile",
                method: "PUT",
                params: { firstName, lastName, phone },
            });

            if (!res?.success) {
                hyveError("Couldn't save changes", res?.message || "Please try again.");
                return;
            }

            localStorage.setItem("user", JSON.stringify(res.data));
            hyveSuccess("Profile updated", "Your changes have been saved.");
            navigate("/user/profile");
        } catch (err) {
            hyveError("Couldn't save changes", "Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
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
                                    <img src={profileImage} alt="profile image" className='object-cover w-full h-full' />
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
                                <form onSubmit={handleSaveInfo} className='flex flex-col gap-3 mt-2'>
                                    <div className=''>
                                        <label htmlFor="firstname" className='text-[#AAAAAA] text-sm'>First name</label>
                                        <input
                                            id="firstname"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className='update_user_info'
                                            placeholder='First name'
                                        />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="lastname" className='text-[#AAAAAA] text-sm'>Last name</label>
                                        <input
                                            id="lastname"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className='update_user_info'
                                            placeholder='Last name'
                                        />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="email" className='text-[#AAAAAA] text-sm'>Email</label>
                                        <input type="text" value={email} disabled className='update_user_info' placeholder='Your email address' />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="phone_number" className='text-[#AAAAAA] text-sm'>Phone number</label>
                                        <input
                                            id="phone_number"
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className='update_user_info'
                                            placeholder='Phone number'
                                        />
                                    </div>

                                    <div className='flex justify-end mt-4'>
                                        <button type="submit" disabled={isSaving} className='px-6 md:px-8 bg-primary hover:bg-primary-hover rounded-[8px] smooth-transition  py-3 shadow-md disabled:opacity-60'>
                                            <p className='text-sm font-medium text-white font-athiti'>
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </p>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Change Password: no endpoint exists on the backend for this yet
                                (checked the live Swagger docs — only register/login/verify-otp/
                                resend-otp exist under Authentication). Left as a visual section
                                but disabled with an explanation instead of pretending it works. */}
                            <div className='mt-16'>
                                <p className='text-sm'>Change Password</p>
                                <p className='mt-1 text-xs text-[#AAAAAA]'>Not available yet — the backend doesn't have a change-password endpoint.</p>
                                <form className='flex flex-col gap-4 mt-2 opacity-50 pointer-events-none'>
                                    <div className=''>
                                        <label htmlFor="current_password" className='text-[#AAAAAA] text-sm'>Current Password</label>
                                        <input type="password" className='update_user_info' placeholder='Current password' disabled />
                                    </div>
                                    <div className=''>
                                        <label htmlFor="new_password" className='text-[#AAAAAA] text-sm'>New Password</label>
                                        <input type="password" className='update_user_info' placeholder='New password' disabled />
                                    </div>
                                    <div className='flex justify-end mt-4'>
                                        <button type="button" disabled className='px-6 md:px-8 bg-primary rounded-[8px] py-3 md:py-3 shadow-md'>
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
