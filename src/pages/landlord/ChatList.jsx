import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChatRooms, getCurrentUserId } from '../../utils/chatApi';
import Sidebar from './components/layout/Sidebar/Sidebar';
import Header from './components/layout/Dashboard/Header';
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab';
import ChatItem from './components/layout/Chat/ChatItem';
import { hyveError } from '../../utils/hyveToast';

import { IoChatbubblesOutline, IoSearchOutline } from 'react-icons/io5';

const LandlordChatList = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const currentUserId = getCurrentUserId();

    const fetchRooms = () => {
        setIsLoading(true);
        getChatRooms()
            .then(setRooms)
            .catch((err) => {
                console.error("Failed to load landlord chat rooms:", err);
                hyveError("Couldn't load chats", err?.message || "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Get the student/tenant on the other side of this 1:1 room
    const getOtherParticipant = (room) => {
        return room.participants?.find((p) => p.id !== currentUserId) || room.participants?.[0];
    };

    // Filter rooms by participant name
    const filteredRooms = rooms.filter((room) => {
        const other = getOtherParticipant(room);
        const fullName = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase().trim());
    });

    return (
        <div className='page-wrapper'>
            <div className='flex'>
                {/* Dashboard sidebar */}
                <Sidebar currentPage={"chats"} />

                {/* Dashboard content area */}
                <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto bg-[#FAF7F5]/30'>
                    {/* Header */}
                    <Header />

                    <div className='px-4 sm:px-8 py-6 pb-28 max-w-4xl mx-auto'>
                        {/* Page Title & Count */}
                        <div className="flex items-center justify-between pb-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold font-poppins text-[#3D3129]">
                                    Tenant Inquiries & Chats
                                </h1>
                                <p className="text-xs text-[#3D3129]/60 mt-0.5">
                                    Communicate directly with prospective tenants & users
                                </p>
                            </div>
                            {!isLoading && rooms.length > 0 && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary font-poppins">
                                    {rooms.length} {rooms.length === 1 ? 'chat' : 'chats'}
                                </span>
                            )}
                        </div>

                        {/* Search Bar (visible if there are rooms or search active) */}
                        {(rooms.length > 0 || searchQuery) && (
                            <div className="relative mb-5">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D3129]/50 text-base">
                                    <IoSearchOutline />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations by user name..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-[#3D3129]/15 bg-white focus:border-primary outline-none shadow-sm transition-colors"
                                />
                            </div>
                        )}

                        {/* Content States */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="spinner w-[32px] h-[32px]"></div>
                                <p className='text-xs sm:text-sm text-[#888888] font-poppins mt-3'>
                                    Loading your conversations...
                                </p>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="py-16 px-6 text-center border-2 border-dashed border-[#FF6300]/25 rounded-2xl bg-[#FFF0E6]/30 flex flex-col items-center justify-center my-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 text-2xl">
                                    <IoChatbubblesOutline />
                                </div>
                                <h3 className="font-poppins text-lg font-semibold text-[#3D3129]">
                                    No tenant inquiries yet
                                </h3>
                                <p className="text-xs sm:text-sm text-[#3D3129]/60 max-w-sm mt-1 mb-4">
                                    When prospective users view your listings and reach out with questions or booking requests, their chats will appear right here.
                                </p>
                                <Link
                                    to="/landlord/dashboard"
                                    className="px-5 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
                                >
                                    View Your Listings
                                </Link>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-sm text-[#888888]">No conversations match "{searchQuery}"</p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 text-xs text-primary font-medium hover:underline"
                                >
                                    Clear search filter
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-[#FF6300]/15 shadow-sm divide-y divide-black/5 p-2 sm:p-3">
                                {filteredRooms.map((room) => {
                                    const other = getOtherParticipant(room);
                                    const name = `${other?.firstName || ''} ${other?.lastName || ''}`.trim() || 'Prospective Tenant';
                                    const roleDesc = other?.role === 'STUDENT' ? 'User' : 'Tenant';

                                    return (
                                        <Link
                                            key={room.id}
                                            to={`/landlord/conversation/${room.id}`}
                                            className='block'
                                        >
                                            <ChatItem
                                                avatarSrc={other?.profilePictureUrl}
                                                name={name}
                                                lastMessage={other?.online ? '● Online now' : roleDesc}
                                                timestamp=""
                                                isOnline={other?.online}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile navigation */}
            <MobileNavigationTab currentTab={"chats"} />
        </div>
    );
};

export default LandlordChatList;