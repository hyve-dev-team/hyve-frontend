import Sidebar from '../Sidebar/Sidebar'
import { conversationData } from '../../../../../utils/chatData';
import ChatBubble from './ChatBubble';
import ConversationChatHeader from './ConversationChatHeader';
import { IoSendSharp } from "react-icons/io5";

const Conversation = () => {
    // Destructure data
    const { contact, messages } = conversationData;

    return (
        <>
            <div className='page-wrapper'>
                <div className='flex'>
                    {/* dashboard sidebar*/}
                    <Sidebar currentPage={"chats"} />

                    {/* dashboard content area */}
                    <main className='relative w-full h-screen sm:w-[70%] lg:w-[80%] '>
                        {/* conversation header - Fixed at top */}
                        <div className="fixed top-0 left-0 right-0 z-20 bg-white sm:left-[30%] lg:left-[20%]">
                            <ConversationChatHeader contact={contact} />
                        </div>

                        {/* Conversation Body - Scrollable middle section */}
                        <div 
                            className='absolute top-[60px] bottom-[70px] left-0 right-0 overflow-y-auto px-3 sm:px-6 lg:px-4 
                            [&::-webkit-scrollbar]:w-[2px] 
                            [&::-webkit-scrollbar-track]:bg-[#D0D1DB] 
                            [&::-webkit-scrollbar-thumb]:bg-primary 
                            [&::-webkit-scrollbar-thumb]:rounded-full'
                        >
                            <div className="px-0 py-8 pb-10 space-y-3 sm:pb-10 md:px-4">
                                {messages.map(msg => (
                                    <ChatBubble
                                        key={msg.id}
                                        message={msg.text}
                                        isSender={msg.isSender}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Message Input Area - Fixed at bottom */}
                        <div className="fixed bottom-0 left-0 right-0 px-3 sm:px-6 lg:px-8 bg-white z-20 border-t border-[#0000000D] sm:left-[30%] lg:left-[20%]">
                            <div className="flex items-center max-w-full gap-2 pt-3 pb-5 sm:gap-3 sm:pb-4 sm:pt-2">
                                {/* Text Input */}
                                <div className="flex items-center flex-1 bg-gray-100 rounded-full">
                                    <input
                                        type="text"
                                        className="flex-1 text-xs sm:text-sm placeholder-[#D0D1DB] bg-transparent border outline-none border-[#D0D1DB] rounded-lg p-3 px-2 sm:px-3 sm:p-3"
                                        placeholder="Type a message..."
                                    />
                                </div>

                                {/* send message btn */}
                                <button
                                    aria-label="send message"
                                    className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white transition duration-200 rounded-full shadow-md outline-none bg-primary sm:w-12 sm:h-12 lg:hover:bg-primary-hover"
                                >
                                    <IoSendSharp />
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Conversation