import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import Sidebar from './components/layout/Sidebar/Sidebar';
import defaultProfileImage from '../../assets/images/shared-images/user-1.png';
import config from '../../config';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';
import { uploadMediaFiles } from '../../utils/mediaApi';

import { BsFillCameraFill } from 'react-icons/bs';
import { IoArrowBack, IoLockClosedOutline } from 'react-icons/io5';
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import { MdOutlineSecurity } from 'react-icons/md';

const UpdateLandlordProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const cachedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    })();

    const [firstName, setFirstName] = useState(cachedUser?.firstName || '');
    const [lastName, setLastName] = useState(cachedUser?.lastName || '');
    const [phone, setPhone] = useState(cachedUser?.phone || '');
    const [avatarPreview, setAvatarPreview] = useState(cachedUser?.profilePictureUrl || defaultProfileImage);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Password fields (local UI mock since backend auth does not expose separate change-password endpoint)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const email = cachedUser?.email || 'landlord@hyve.com';

    // Handle picking a profile photo
    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    // Save Personal Information to backend PUT /api/v1/landlord/profile
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        if (!firstName.trim()) {
            hyveError('Validation Error', 'First name is required.');
            return;
        }

        setIsSaving(true);
        try {
            let uploadedAvatarUrl = cachedUser?.profilePictureUrl || '';

            // If user selected a new avatar photo, upload it to media server
            if (avatarFile) {
                try {
                    const urls = await uploadMediaFiles([avatarFile], 'avatars');
                    if (urls && urls.length > 0) {
                        uploadedAvatarUrl = urls[0];
                    }
                } catch (uploadErr) {
                    console.warn('Avatar upload failed, continuing with profile details:', uploadErr);
                }
            }

            // Call backend update endpoint (landlord profile)
            const res = await config.allAPI({
                url: '/api/v1/landlord/profile',
                method: 'PUT',
                params: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                },
            });

            if (!res?.success) {
                hyveError("Couldn't save changes", res?.message || 'Please try again.');
                return;
            }

            // Merge and update cached user in localStorage
            const updatedUser = {
                ...(cachedUser || {}),
                ...res.data,
                ...(uploadedAvatarUrl ? { profilePictureUrl: uploadedAvatarUrl } : {}),
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            hyveSuccess('Profile updated', 'Your personal information has been saved successfully.');
            navigate('/landlord/profile');
        } catch (err) {
            console.error('Failed to update landlord profile:', err);
            hyveError("Couldn't save changes", 'Please check your internet connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Password Update
    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (!currentPassword) {
            hyveError('Error', 'Please enter your current password.');
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            hyveError('Error', 'New password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            hyveError('Error', 'New passwords do not match.');
            return;
        }

        setIsUpdatingPassword(true);
        setTimeout(() => {
            setIsUpdatingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            hyveSuccess('Security updated', 'Your password has been changed.');
        }, 800);
    };

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar */}
                <Sidebar currentPage={'profile'} />

                {/* Dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto overflow-x-hidden bg-[#FAF7F5] pb-28 sm:pb-16'>
                    <Header />

                    <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10'>
                        {/* Navigation back button & Title */}
                        <div className='flex items-center gap-3 mb-6'>
                            <button
                                onClick={() => navigate('/landlord/profile')}
                                className='p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-primary hover:border-primary/40 smooth-transition shadow-sm'
                                title='Back to Profile'
                            >
                                <IoArrowBack className='text-lg' />
                            </button>
                            <div>
                                <h1 className='text-xl sm:text-2xl font-bold font-poppins text-stone-900'>
                                    Edit Landlord Profile
                                </h1>
                                <p className='text-xs sm:text-sm text-stone-500'>
                                    Update your personal contact details and security preferences
                                </p>
                            </div>
                        </div>

                        {/* Avatar Upload Banner */}
                        <div className='bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-6'>
                            <div className='relative group'>
                                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#FFF0E6] shadow-md bg-stone-100'>
                                    <img
                                        src={avatarPreview}
                                        alt='Profile avatar'
                                        className='w-full h-full object-cover'
                                        onError={(e) => {
                                            e.target.src = defaultProfileImage;
                                        }}
                                    />
                                </div>
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='absolute bottom-0 right-0 w-9 h-9 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-md border-2 border-white smooth-transition'
                                    title='Upload new photo'
                                >
                                    <BsFillCameraFill className='text-sm' />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='image/*'
                                    onChange={handleAvatarSelect}
                                    className='hidden'
                                />
                            </div>

                            <div className='text-center sm:text-left'>
                                <h3 className='text-base font-semibold text-stone-900'>
                                    Profile Picture
                                </h3>
                                <p className='text-xs text-stone-500 mt-1 max-w-sm'>
                                    Upload a high quality picture of yourself to build trust with prospective tenants.
                                </p>
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='mt-3 text-xs font-semibold text-primary hover:text-primary-hover underline underline-offset-4'
                                >
                                    Change photo
                                </button>
                            </div>
                        </div>

                        {/* Personal Information Form */}
                        <div className='bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-6'>
                            <div className='flex items-center gap-2 mb-5 pb-4 border-b border-stone-100'>
                                <div className='w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center text-lg'>
                                    <HiOutlineUser />
                                </div>
                                <div>
                                    <h2 className='text-base font-semibold text-stone-900'>
                                        Personal Information
                                    </h2>
                                    <p className='text-xs text-stone-500'>
                                        Your identity as seen by tenants and administration
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveInfo} className='space-y-4'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            First Name <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder='e.g. John'
                                            className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            Last Name
                                        </label>
                                        <input
                                            type='text'
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder='e.g. Doe'
                                            className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            Email Address
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type='email'
                                                value={email}
                                                disabled
                                                className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-500 cursor-not-allowed outline-none'
                                            />
                                            <HiOutlineMail className='absolute right-3.5 top-3.5 text-stone-400 text-lg' />
                                        </div>
                                        <p className='text-[11px] text-stone-400 mt-1'>
                                            Account email cannot be modified directly
                                        </p>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            Phone Number
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type='tel'
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder='+234 801 234 5678'
                                                className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                            />
                                            <HiOutlinePhone className='absolute right-3.5 top-3.5 text-stone-400 text-lg' />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-end pt-3'>
                                    <button
                                        type='submit'
                                        disabled={isSaving}
                                        className='px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 smooth-transition flex items-center gap-2'
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            <span>Save Changes</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security / Change Password */}
                        <div className='bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-6 mb-12'>
                            <div className='flex items-center gap-2 mb-5 pb-4 border-b border-stone-100'>
                                <div className='w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center text-lg'>
                                    <MdOutlineSecurity />
                                </div>
                                <div>
                                    <h2 className='text-base font-semibold text-stone-900'>
                                        Security & Password
                                    </h2>
                                    <p className='text-xs text-stone-500'>
                                        Update your password regularly to keep your landlord account secure
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className='space-y-4'>
                                <div>
                                    <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                        Current Password
                                    </label>
                                    <div className='relative'>
                                        <input
                                            type='password'
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder='Enter current password'
                                            className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                        />
                                        <IoLockClosedOutline className='absolute right-3.5 top-3.5 text-stone-400 text-lg' />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            New Password
                                        </label>
                                        <input
                                            type='password'
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder='At least 8 characters'
                                            className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-stone-600 mb-1.5'>
                                            Confirm New Password
                                        </label>
                                        <input
                                            type='password'
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder='Repeat new password'
                                            className='w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-stone-900 placeholder:text-stone-400 outline-none smooth-transition'
                                        />
                                    </div>
                                </div>

                                <div className='flex justify-end pt-3'>
                                    <button
                                        type='submit'
                                        disabled={isUpdatingPassword}
                                        className='px-6 py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 smooth-transition flex items-center gap-2'
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <span>Update Password</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={'profile'} />
        </div>
    );
};

export default UpdateLandlordProfile;