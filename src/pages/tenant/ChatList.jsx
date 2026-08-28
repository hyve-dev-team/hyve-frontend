
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getChatRooms, getCurrentUserId } from '../../utils/chatApi'
import ChatItem from './components/layout/Chat/ChatItem'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import Sidebar from './components/layout/Sidebar/Sidebar'
import { hyveError } from '../../utils/hyveToast'

const ChatList = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUserId = getCurrentUserId();

    useEffect(() => {
        getChatRooms()
            .then(setRooms)
            .catch((err) => {
                console.error("Failed to load chat rooms:", err);
                hyveError("Couldn't load chats", "Please refresh and try again.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    // The other person in a 1:1 room — whichever participant isn't the logged-in user.
    const getOtherParticipant = (room) =>
        room.participants?.find((p) => p.id !== currentUserId) || room.participants?.[0];

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"chats"} />

                    {/* dashboard content area */}
                    <main className='w-full h-[100svh] sm:w-[70%] lg:w-[80%] overflow-auto'>
                        {/* dashboard header */}
                        <Header />

                        <div className='px-3 pb-20 mt-6 sm:pb-16 sm:px-6 lg:px-8 lg:mt-8'>
                            <div className="pb-2 md:pb-4">
                                <h2 className="text-[16px] md:text-[20px] font-semibold font-poppins">Chats</h2>
                            </div>

                            {isLoading ? (
                                <p className='py-12 text-sm text-center text-[#AAAAAA]'>Loading chats...</p>
                            ) : rooms.length === 0 ? (
                                <p className='py-12 text-sm text-center text-[#AAAAAA]'>No conversations yet. Message a landlord from a listing to start one.</p>
                            ) : (
                                <div className="divide-y divide-[#0000000D]">
                                    {rooms.map(room => {
                                        const other = getOtherParticipant(room);
                                        return (
                                            <Link key={room.id} to={`/user/conversation/${room.id}`} className='block'>
                                                <ChatItem
                                                    avatarSrc={other?.profilePictureUrl}
                                                    name={`${other?.firstName || ""} ${other?.lastName || ""}`.trim() || "Unknown"}
                                                    lastMessage={other?.online ? "Online" : "Tap to view conversation"}
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
        </>
    )
}

export default ChatList
