import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import ProfileOption from './components/layout/Profile/ProfileOption';
import defaultProfileImage from '../../assets/images/shared-images/user-1.png';

import { HiOutlineUser, HiOutlineShieldCheck } from 'react-icons/hi2';
import { GrTransaction } from 'react-icons/gr';
import { IoLogOutOutline } from 'react-icons/io5';
import { BsFillCameraFill } from 'react-icons/bs';
import { MdVerified } from 'react-icons/md';

const LandlordProfile = () => {
    const navigate = useNavigate();

    // Read authenticated landlord user from localStorage
    const cachedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    })();

    const [user] = useState(() => {
        if (!cachedUser) {
            return {
                name: 'Landlord',
                email: 'landlord@hyve.com',
                phone: '',
                profileImage: defaultProfileImage,
                isVerified: false,
            };
        }
        const name = `${cachedUser.firstName || ''} ${cachedUser.lastName || ''}`.trim() || cachedUser.fullname || cachedUser.fullName || 'Landlord';
        const email = cachedUser.email || '';
        const phone = cachedUser.phone || cachedUser.phoneNumber || '';
        const profileImage = cachedUser.profilePictureUrl || defaultProfileImage;
        const isVerified = Boolean(cachedUser.isVerified || cachedUser.verified);
        return { name, email, phone, profileImage, isVerified };
    });

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'L';

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* dashboard sidebar*/}
                <Sidebar currentPage={'profile'} />

                {/* dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto overflow-x-hidden'>
                    {/* dashboard header */}
                    <Header />

                    <div className='px-4 sm:px-6 lg:px-8 py-6 pb-32 sm:pb-20'>
                        <div className='w-full max-w-xl mx-auto'>
                            {/* User profile information card / header */}
                            <div className='flex flex-col items-center text-center'>
                                {/* Avatar with camera shortcut to edit profile */}
                                <div className='relative group'>
                                    <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-orange-100 shadow-md bg-gradient-to-br from-[#FFF0E6] to-[#FFE2D1] flex items-center justify-center text-primary font-bold text-3xl font-poppins'>
                                        {user.profileImage && user.profileImage !== defaultProfileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt='profile'
                                                className='object-cover w-full h-full'
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </div>

                                    <Link
                                        to='/landlord/profile/update'
                                        title='Change photo'
                                        className='absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md ring-2 ring-white transition-transform duration-200 hover:scale-110'
                                    >
                                        <BsFillCameraFill className='text-xs' />
                                    </Link>
                                </div>

                                {/* Name & Badges */}
                                <div className='mt-4 flex flex-col items-center'>
                                    <div className='flex items-center gap-1.5'>
                                        <h3 className='text-xl sm:text-2xl font-bold font-poppins text-stone-900'>
                                            {user.name}
                                        </h3>
                                        {user.isVerified && (
                                            <MdVerified
                                                className='text-emerald-500 text-lg sm:text-xl flex-shrink-0'
                                                title='Verified Account'
                                            />
                                        )}
                                    </div>

                                    {/* Role & Verification chips */}
                                    <div className='mt-1.5 flex items-center gap-2 flex-wrap justify-center'>
                                        <span className='px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200'>
                                            Landlord Account
                                        </span>
                                        {user.isVerified ? (
                                            <span className='px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className='px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-primary border border-orange-200/80 inline-flex items-center gap-1'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-primary' />
                                                Verification Pending
                                            </span>
                                        )}
                                    </div>

                                    <p className='mt-1.5 text-xs sm:text-sm text-stone-500 font-normal'>
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Profile action cards */}
                            <div className='flex flex-col gap-3 sm:gap-3.5 w-full mt-8'>
                                <ProfileOption
                                    to='/landlord/verification'
                                    icon={HiOutlineShieldCheck}
                                    title='Verification'
                                    subtitle='Identity & property ownership documents'
                                    badge={user.isVerified ? 'Verified' : 'Required'}
                                    badgeClass={
                                        user.isVerified
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                            : 'bg-orange-50 text-primary border border-orange-200/80'
                                    }
                                />
                                <ProfileOption
                                    to='/landlord/profile/update'
                                    icon={HiOutlineUser}
                                    title='Edit Profile'
                                    subtitle='Personal details, contact & password'
                                />
                                <ProfileOption
                                    to='/landlord/activity'
                                    icon={GrTransaction}
                                    title='Activity'
                                    subtitle='Bookings, earnings & transaction history'
                                />
                            </div>

                            {/* Sign out action button */}
                            <div className='mt-10 text-center'>
                                <button
                                    type='button'
                                    onClick={handleSignOut}
                                    className='px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-hover shadow-sm hover:shadow-md smooth-transition inline-flex items-center gap-2 cursor-pointer'
                                >
                                    <IoLogOutOutline className='text-lg' />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={'profile'} />
        </div>
    );
};

export default LandlordProfile;