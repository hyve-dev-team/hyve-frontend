
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import hyveLogo from "../../assets/svg/logo/hyve-logo.svg"
import Sidebar from './components/layout/Sidebar/Sidebar'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import { LuArrowLeft } from "react-icons/lu";
import NotificationItem from './components/layout/Notification/NotificationItem';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../utils/notificationsApi';
import { hyveError } from '../../utils/hyveToast';

// The real Notification object only has a `type` string (server-defined, e.g.
// "MESSAGE", "SAVE", "REVIEW"), not a direct link — so route by best-effort
// keyword match. Falls back to staying on this page (still marks as read) if the
// type doesn't match anything recognized.
function linkForType(type = "") {
    const t = type.toLowerCase();
    if (t.includes("message") || t.includes("chat")) return "/user/chats";
    if (t.includes("save")) return "/user/apartment/saved";
    if (t.includes("review")) return "/user/apartment/manage";
    if (t.includes("book") || t.includes("reserv")) return "/user/apartment/manage";
    return null;
}

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = () => {
        setIsLoading(true);
        getNotifications()
            .then(setNotifications)
            .catch((err) => {
                console.error("Failed to load notifications:", err);
                hyveError("Couldn't load notifications", "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleGoBack = () => {
        navigate(-1)
    }

    const handleNotificationClick = async (notification) => {
        // Optimistic: mark read in the UI immediately, then confirm with the server.
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
                            <button aria-label="Go back" onClick={handleGoBack} className="text-xl text-gray-700">
                                <LuArrowLeft />
                            </button>

                            <div className='w-[80px] sm:w-[90px] ml-4 lg:ml-6'>
                                <Link to={"/user/dashboard"}>
                                    <img src={hyveLogo} alt="Hyve-logo" className='object-cover w-full' />
                                </Link>
                            </div>
                        </header>

                        <div className='px-3 pb-24 mt-8 sm:pb-16 sm:px-6 lg:px-16 lg:mt-10'>
                            <div className='w-full lg:w-[70%] mx-auto '>
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

                                {isLoading ? (
                                    <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading notifications...</p>
                                ) : notifications.length === 0 ? (
                                    <p className='py-12 text-sm text-center text-[#AAAAAA]'>You have no notifications yet.</p>
                                ) : (
                                    <div className="divide-y divide-[#0000000D]">
                                        {notifications.map(notification => (
                                            <NotificationItem
                                                key={notification.id}
                                                title={notification.message}
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

export default Notifications
