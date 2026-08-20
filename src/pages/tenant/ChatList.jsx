import { Link } from 'react-router-dom'
import { chatData } from '../../utils/chatData'
import ChatItem from './components/layout/Chat/ChatItem'
import Header from './components/layout/Dashboard/Header'
import MobileNavigationTab from './components/layout/MobileNavigation/MobileNavigationTab'
import Sidebar from './components/layout/Sidebar/Sidebar'

const ChatList = () => {
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

                            <div className="divide-y divide-[#0000000D]">
                                {chatData.map(chat => (
                                    <Link  key={chat.id} to={`/user/conversation/${chat.id}`} className='block'>
                                        <ChatItem
                                            avatarSrc={chat.avatarSrc}
                                            name={chat.name}
                                            lastMessage={chat.lastMessage}
                                            timestamp={chat.timestamp}
                                            isOnline={chat.isOnline}
                                        />
                                    </Link>
                                ))}
                            </div>
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