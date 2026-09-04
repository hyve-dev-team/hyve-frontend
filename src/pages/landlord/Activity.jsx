import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import Sidebar from './components/layout/Sidebar/Sidebar';

import { IoArrowBack } from 'react-icons/io5';
import { FiActivity, FiCheckCircle } from 'react-icons/fi';
import { BsCashStack, BsHouseDoor } from 'react-icons/bs';
import { RiCloseCircleLine } from 'react-icons/ri';

const LandlordActivity = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('ALL');

    const activities = [
        {
            id: 1,
            type: 'BOOKING',
            title: 'New Booking Inquiry',
            detail: 'User requested to schedule a tour at Ivory Heights Luxury Apt',
            time: '2 hours ago',
            date: 'Today',
            status: 'Pending',
            statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            id: 2,
            type: 'REVENUE',
            title: 'Payment Received',
            detail: 'Annual rent payment processed for Swift Lodge Studio',
            time: 'Yesterday',
            date: 'Sep 03',
            amount: '₦ 850,000',
            status: 'Completed',
            statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
            id: 3,
            type: 'LISTING',
            title: 'Property Listing Published',
            detail: 'Palm Grove 2-Bedroom Apartment approved and active',
            time: '3 days ago',
            date: 'Sep 01',
            status: 'Active',
            statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
            id: 4,
            type: 'CANCEL',
            title: 'Tour Cancelled',
            detail: 'Tenant cancelled scheduled weekend viewing',
            time: '5 days ago',
            date: 'Aug 30',
            status: 'Cancelled',
            statusColor: 'bg-stone-100 text-stone-600 border-stone-200',
        },
    ];

    const filtered = filter === 'ALL' ? activities : activities.filter((a) => a.type === filter);

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar */}
                <Sidebar currentPage={'profile'} />

                {/* Dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-y-auto overflow-x-hidden bg-[#FAF7F5] pb-28 sm:pb-16'>
                    <Header />

                    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10'>
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
                                    Activity & Transactions
                                </h1>
                                <p className='text-xs sm:text-sm text-stone-500'>
                                    Track property inquiries, earnings, and operations in real-time
                                </p>
                            </div>
                        </div>

                        {/* Top Metric Cards */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <div className='bg-white p-5 rounded-3xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'>
                                <div className='w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center text-xl mb-3'>
                                    <BsCashStack />
                                </div>
                                <p className='text-xs font-medium text-stone-500'>Estimated Earnings</p>
                                <h3 className='text-xl font-bold font-poppins text-stone-900 mt-1'>₦ 1,450,000</h3>
                                <p className='text-[11px] text-emerald-600 font-medium mt-1'>+14% from last quarter</p>
                            </div>

                            <div className='bg-white p-5 rounded-3xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'>
                                <div className='w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-3'>
                                    <FiCheckCircle />
                                </div>
                                <p className='text-xs font-medium text-stone-500'>Completed Bookings</p>
                                <h3 className='text-xl font-bold font-poppins text-stone-900 mt-1'>8 Bookings</h3>
                                <p className='text-[11px] text-stone-400 mt-1'>All contracts fulfilled</p>
                            </div>

                            <div className='bg-white p-5 rounded-3xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'>
                                <div className='w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-3'>
                                    <BsHouseDoor />
                                </div>
                                <p className='text-xs font-medium text-stone-500'>Active Listings</p>
                                <h3 className='text-xl font-bold font-poppins text-stone-900 mt-1'>3 Properties</h3>
                                <p className='text-[11px] text-stone-400 mt-1'>Visible to users</p>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className='mt-8 flex items-center gap-2 overflow-x-auto pb-2 scroll-bar-hidden'>
                            {['ALL', 'BOOKING', 'REVENUE', 'LISTING'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap smooth-transition ${
                                        filter === type
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-white border border-stone-200 text-stone-600 hover:border-primary/40'
                                    }`}
                                >
                                    {type === 'ALL'
                                        ? 'All Activity'
                                        : type === 'BOOKING'
                                        ? 'Bookings & Tours'
                                        : type === 'REVENUE'
                                        ? 'Earnings'
                                        : 'Listings'}
                                </button>
                            ))}
                        </div>

                        {/* Activity Timeline List */}
                        <div className='bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mt-4 mb-12'>
                            <div className='divide-y divide-stone-100'>
                                {filtered.map((item) => (
                                    <div key={item.id} className='py-4 first:pt-2 last:pb-2 flex items-start justify-between gap-4'>
                                        <div className='flex items-start gap-3.5'>
                                            <div
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5 ${
                                                    item.type === 'REVENUE'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : item.type === 'BOOKING'
                                                        ? 'bg-orange-50 text-primary'
                                                        : item.type === 'CANCEL'
                                                        ? 'bg-red-50 text-red-500'
                                                        : 'bg-blue-50 text-blue-600'
                                                }`}
                                            >
                                                {item.type === 'REVENUE' ? (
                                                    <BsCashStack />
                                                ) : item.type === 'BOOKING' ? (
                                                    <FiActivity />
                                                ) : item.type === 'CANCEL' ? (
                                                    <RiCloseCircleLine />
                                                ) : (
                                                    <BsHouseDoor />
                                                )}
                                            </div>

                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <h4 className='text-sm font-semibold text-stone-900'>
                                                        {item.title}
                                                    </h4>
                                                    <span
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.statusColor}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className='text-xs text-stone-500 mt-1 max-w-md'>
                                                    {item.detail}
                                                </p>
                                                <p className='text-[11px] text-stone-400 mt-1.5'>
                                                    {item.time}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='text-right flex-shrink-0'>
                                            {item.amount && (
                                                <p className='text-sm font-bold text-stone-900'>
                                                    {item.amount}
                                                </p>
                                            )}
                                            <p className='text-xs text-stone-400 font-medium'>
                                                {item.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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

export default LandlordActivity;