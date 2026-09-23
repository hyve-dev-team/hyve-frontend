import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"
import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { LuArrowLeft } from "react-icons/lu";
import NotificationItem from './components/layout/Notification/NotificationItem';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '../../utils/notificationsApi';
import { hyveSuccess, hyveError } from '../../utils/hyveToast';

function linkForType(type = "") {
    const t = type.toLowerCase();
    if (t.includes("message") || t.includes("chat")) return "/landlord/chats";
    if (t.includes("review") || t.includes("property")) return "/landlord/activity";
    if (t.includes("escrow") || t.includes("payment")) return "/landlord/activity";
    if (t.includes("tour") || t.includes("inspection")) return "/landlord/activity";
    if (t.includes("move_in") || t.includes("move")) return "/landlord/dashboard";
    return "/landlord/dashboard";
}

const LandlordNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = () => {
        setIsLoading(true);
        getNotifications()
            .then(setNotifications)
            .catch((err) => {
                console.error("Failed to load landlord notifications:", err);
                hyveError("Couldn't load notifications", "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleNotificationClick = async (notification) => {
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
        try {
            await markNotificationAsRead(notification.id);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
        const link = linkForType(notification.type);
        if (link) navigate(link);
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllNotificationsAsRead();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            hyveError("Couldn't mark all as read", "Please try again.");
        }
    };

    const handleClearAll = async () => {
        const prev = [...notifications];
        setNotifications([]);
        try {
            await clearAllNotifications();
            hyveSuccess("Notifications Cleared", "All notifications have been cleared.");
        } catch (err) {
            console.error("Failed to clear notifications:", err);
            setNotifications(prev);
            hyveError("Couldn't clear notifications", "Please try again.");
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const formatDate = (iso) => {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
        } catch {
            return "";
        }
    };

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
                            <button aria-label="Go back" onClick={handleGoBack} className="text-xl text-gray-700 cursor-pointer">
                                <LuArrowLeft />
                            </button>

                            {/* Logo */}
                            <div className='w-[80px] sm:w-[90px] ml-4 lg:ml-6'>
                                <Link to={"/landlord/dashboard"}>
                                    <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                                </Link>
                            </div>
                        </header>

                        <div className='px-3 pb-24 mt-8 sm:pb-16 sm:px-6 lg:px-16 lg:mt-10'>
                            <div className='w-full lg:w-[70%] mx-auto '>
                                {/* Title and Controls */}
                                <div className="flex items-center justify-between mb-2 md:mb-6">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-[16px] md:text-[24px] font-semibold text-gray-900 font-poppins">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {unreadCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-primary hover:underline font-medium cursor-pointer"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleClearAll}
                                                className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Notification Items */}
                                {isLoading ? (
                                    <div className="py-12 text-center text-sm text-[#AAAAAA]">
                                        Loading notifications...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-[#AAAAAA]">
                                        No notifications yet. When prospective tenants inspect your property, pay rent into escrow, or schedule move-in, you'll receive real-time updates here.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#0000000D]">
                                        {notifications.map((notification) => (
                                            <NotificationItem
                                                key={notification.id}
                                                title={notification.message || notification.title}
                                                type={notification.type}
                                                date={formatDate(notification.createdAt)}
                                                read={notification.read}
                                                onClick={() => handleNotificationClick(notification)}
                                            />
                                        ))}
                                    </div>
                                )}
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

export default LandlordNotifications