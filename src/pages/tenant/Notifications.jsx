
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"
import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { LuArrowLeft } from "react-icons/lu";
import notificationData from '../../utils/notificationdata';
import NotificationItem from './components/layout/Notification/NotificationItem';
import { getReadIds, markAsRead, markAllAsRead, subscribeToNotificationChanges } from '../../utils/notifications';

const Notifications = () => {
    const navigate = useNavigate();

    // Read/unread state persists via localStorage (see utils/notifications.js).
    // Swap getReadIds()/markAsRead() for real API calls once the backend has
    // GET /notifications and a mark-as-read endpoint.
    const [readIds, setReadIds] = useState(() => getReadIds());

    useEffect(() => {
        const sync = () => setReadIds(getReadIds());
        const unsubscribe = subscribeToNotificationChanges(sync);
        return unsubscribe;
    }, []);

    /* function to handle "Go back" btn on notification page */
    const handleGoBack = () => {
        navigate(-1)
    }

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) navigate(notification.link);
    };

    const handleMarkAllRead = () => {
        markAllAsRead(notificationData.map((n) => n.id));
    };

    const unreadCount = notificationData.filter((n) => !readIds.includes(n.id)).length;

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* Notification page Navbar */}
                        <header className="sticky top-0 z-20 flex items-center justify-between px-3 pt-5 pb-4 bg-white border-b sm:pt-6 sm:pb-6 sm:px-6 lg:px-16 lg:flex-row border-[#0000000D]">
                            {/* Back Arrow Placeholder */}
                            <button aria-label="Go back" onClick={handleGoBack} className="text-xl text-gray-700">
                                <LuArrowLeft />
                            </button>


                            {/* Logo */}
                            <div className='w-[80px] sm:w-[90px] ml-4 lg:ml-6'>
                                <Link to={"/user/dashboard"}>
                                    <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                                </Link>
                            </div>
                        </header>

                        <div className='px-3 pb-24 mt-8 sm:pb-16 sm:px-6 lg:px-16 lg:mt-10'>
                            <div className='w-full lg:w-[70%] mx-auto '>
                                {/* Title */}
                                <div className="flex items-center justify-between mb-2 md:mb-6">
                                    <h3 className="text-[16px] md:text-[24px] font-semibold text-gray-900 font-poppins">
                                        Notifications
                                        {unreadCount > 0 && (
                                            <span className="ml-2 align-middle text-[11px] md:text-xs bg-primary text-white rounded-full px-2 py-0.5">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </h3>

                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllRead}
                                            className="text-xs md:text-sm font-medium text-primary hover:underline"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                {/* Notification Item */}
                                <div className="divide-y divide-[#0000000D]">
                                    {notificationData.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            title={notification.title}
                                            date={notification.date}
                                            read={readIds.includes(notification.id)}
                                            onClick={() => handleNotificationClick(notification)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                {/* Mobile navigation */}
                <MobileNavigationTab />
            </div>
        </>
    )
}

export default Notifications
